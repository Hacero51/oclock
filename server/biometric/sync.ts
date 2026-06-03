import prisma from "@/lib/prisma";
import { BiometricConnection } from "./connection";
import { BiometricLog } from "./types";
import crypto from "crypto";
import { laborEngine } from "./engine";

/**
 * Sincroniza los relojes con la DB.
 * Estrategia:
 * 1. Obtiene máquinas activas (ConnectionStatus: 1)
 * 2. Conecta y descarga logs (Python para Legacy, Node nativo/ADMS para otros)
 * 3. Guarda en DB
 */
function logToDebugFile(message: string) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] ${message}`);
    }
}

export async function sincronizarRelojes(devicesToSync?: string[]) {
    const affectedDays = new Map<string, Set<string>>(); // EmployeeOid -> Set of ISO Days

    try {
        logToDebugFile(`[SYNC] Iniciando sincronización...`);
        
        const machines = await prisma.machine.findMany({
            where: {
                ConnectionStatus: 1
            },
        });

        logToDebugFile(`[SYNC] Máquinas encontradas en DB: ${machines.length} (${machines.map(m => m.Name).join(', ')})`);

        const machineDetails = await prisma.machinezk.findMany({
            where: { Oid: { in: machines.map(m => m.Oid) } }
        });

        let totalLogs = 0;
        let newRecords = 0;
        let updatedMachines = 0;

        for (const machine of machines) {
            const detail = machineDetails.find(d => d.Oid === machine.Oid);
            if (!detail || !detail.IP) {
                logToDebugFile(`[SYNC] OMITIENDO ${machine.Name}: Sin detalles o IP.`);
                continue;
            }

            // Unificación: Usar SIEMPRE el servicio Python para todos los dispositivos
            // Esto garantiza consistencia y aprovecha la mayor compatibilidad de pyzk.
            logToDebugFile(`[SYNC] Conectando a ${machine.Name} (IP: ${detail.IP}) via Python Service...`);
            console.log(`[SYNC] Conectando a ${machine.Name} (IP: ${detail.IP}) via Python Service...`);

            try {
                const pwd = detail.Password ? parseInt(detail.Password) : 0;
                // Llamada unificada al microservicio Python
                const pyResult = await syncWithPython(detail.IP, detail.Port || 4370, pwd);

                logToDebugFile(`[SYNC-PY] Resultado para ${machine.Name}: ${pyResult.success ? 'EXITO' : 'FALLO'}`);

                if (pyResult.success && pyResult.logs) {
                    const cantidad = pyResult.logs.length;
                    console.log(`[SYNC-PY] ${machine.Name}: Recibidos ${cantidad} logs.`);
                    logToDebugFile(`[SYNC-PY] ${machine.Name}: ${cantidad} logs descargados.`);

                    // ACTUALIZACIÓN TEMPRANA: Marcar LastDownload inmediatamente
                    await prisma.machine.update({
                        where: { Oid: machine.Oid },
                        data: { LastDownload: new Date(), ConnectionStatus: 1 }
                    });
                    updatedMachines++;

                    totalLogs += cantidad;

                    // FILTRADO INTELIGENTE: Ignorar logs muy antiguos ya procesados
                    let logsAProcesar = pyResult.logs;
                    
                    // FALLBACK DE SEGURIDAD: Si no hay LastDownload (ej: reset de DB), usar 30 días atrás como base
                    const baseDate = machine.LastDownload 
                        ? new Date(machine.LastDownload) 
                        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                    const cutoffDate = new Date(baseDate);
                    cutoffDate.setHours(cutoffDate.getHours() - 6); // 6 horas atrás por seguridad (optimización clave para evitar saturación)

                    logsAProcesar = pyResult.logs.filter((l: any) => {
                        const t = new Date(l.timestamp);
                        return t > cutoffDate;
                    });

                    if (logsAProcesar.length < pyResult.logs.length) {
                        logToDebugFile(`[SYNC-PY] Filtrados ${pyResult.logs.length - logsAProcesar.length} logs antiguos. Procesando ${logsAProcesar.length} recientes.`);
                    }

                    // ORDENAR CRONOLÓGICAMENTE: Priorizar los registros más antiguos primero para que la lógica "Primer Golpe = Entrada" funcione.
                    // Los dispositivos a veces envían desordenado o Newest-First.
                    const logsOrdenados = [...logsAProcesar].sort((a, b) => {
                        const tA = new Date((a as any).timestamp || a.recordTime).getTime();
                        const tB = new Date((b as any).timestamp || b.recordTime).getTime();
                        return tA - tB;
                    });

                    // OPTIMIZACIÓN 1: Agrupar logs por usuario para procesar usuarios en paralelo
                    const logsPorUsuario: { [key: string]: BiometricLog[] } = {};
                    logsOrdenados.forEach(log => {
                        // FIX: Typescript property check
                        const uid = (log as any).user_id || log.deviceUserId;
                        if (!logsPorUsuario[uid]) {
                            logsPorUsuario[uid] = [];
                        }
                        logsPorUsuario[uid].push(log);
                    });

                    // Cache de Empleados
                    const employeeCache = new Map<string, any>();
                    const userIds = Object.keys(logsPorUsuario);

                    // --- NUEVA FASE: Sincronización de Usuarios ---
                    if (pyResult.users && pyResult.users.length > 0) {
                        logToDebugFile(`[SYNC] Sincronizando ${pyResult.users.length} usuarios de ${machine.Name}...`);
                        for (const u of pyResult.users) {
                            try {
                                await ensureEmployee(u.user_id, u.name || `ID ${u.user_id}`, employeeCache);
                            } catch (errU) {
                                console.error(`[SYNC-USER] Error sincronizando usuario ${u.user_id}:`, errU);
                            }
                        }
                    }

                    const CHUNK_SIZE = 10;
                    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
                        const chunkUsers = userIds.slice(i, i + CHUNK_SIZE);
                        await Promise.all(chunkUsers.map(async (userId) => {
                            const userLogs = logsPorUsuario[userId];
                            
                            // Buscar nombre en la lista de usuarios descargada si no viene en el log
                            const deviceUser = pyResult.users?.find((u: any) => u.user_id === userId);
                            const deviceName = deviceUser?.name || "";

                            for (const log of userLogs) {
                                try {
                                    // DEBUG: Loguear raw timestamp para diagnósticar error de hora
                                    const rawTs = (log as any).timestamp || log.recordTime;
                                    if (Math.random() > 0.99) { // Loguear solo algunos para no saturar
                                        logToDebugFile(`[SYNC-TIME-DEBUG] Machine: ${machine.Name}, Raw: ${rawTs}, ParsedAsLocal: ${new Date(rawTs).toString()}`);
                                    }

                                    // FIX: Regresamos al formato LEGACY (UTC Literal).
                                    // Guardamos la hora del reloj tal cual viene (ej: 05:59) como UTC (05:59Z).
                                    // Esto es necesario para que el motor de cálculo (Engine) funcione correctamente
                                    // con la base de datos restaurada.
                                    const rawTimeStr = String((log as any).timestamp || log.recordTime).replace("T", " ");
                                    const normalizedTime = new Date(rawTimeStr + "Z");

                                    normalizedTime.setMilliseconds(0);

                                    const devUserId = (log as any).user_id || log.deviceUserId;
                                    const status = (log as any).status ?? log.activity ?? 0;
                                    const uid = (log as any).uid || log.userSn;

                                    const result = await procesarRegistroDoble({
                                        uid: uid,
                                        userSn: uid,
                                        deviceUserId: devUserId,
                                        recordTime: normalizedTime,
                                        activity: status,
                                        ip: detail.IP || "",
                                        name: (log as any).name || (log as any).user_name || (log as any).display_name || deviceName || ""
                                    }, machine.Oid, employeeCache);

                                    if (result.created) newRecords++;
                                    if (result.employeeOid && result.dayISO) {
                                        if (!affectedDays.has(result.employeeOid)) {
                                            affectedDays.set(result.employeeOid, new Set());
                                        }
                                        affectedDays.get(result.employeeOid)!.add(result.dayISO);
                                    }
                                } catch (errLog) {
                                    console.error(`[SYNC-PY] Error procesando log individual de ${machine.Name}:`, errLog);
                                }
                            }
                        }));
                    }
                } else {
                    console.error(`[SYNC-PY] Error en ${machine.Name}: ${pyResult.error}`);
                    logToDebugFile(`[SYNC-PY] Error en ${machine.Name}: ${pyResult.error}`);
                }

            } catch (e: any) {
                console.error(`[SYNC-PY] Excepción conectando con ${machine.Name}:`, e);
                logToDebugFile(`[SYNC-PY] Excepción critica con ${machine.Name}: ${e.message}`);
            }
        }

        // --- FASE 2: Cálculo de Nómina (Engine) ---
        if (affectedDays.size > 0) {
            logToDebugFile(`[SYNC-ENGINE] Iniciando recálculo inteligente para ${affectedDays.size} empleados...`);
            
            for (const [empOid, days] of affectedDays.entries()) {
                for (const dayISO of days) {
                    try {
                        const date = new Date(dayISO);
                        await laborEngine.processDay(empOid, date);
                    } catch (engErr) {
                        console.error(`[SYNC-ENGINE] Error calculando horas para ${empOid} en ${dayISO}:`, engErr);
                    }
                }
            }
            logToDebugFile(`[SYNC-ENGINE] Recálculo finalizado.`);
        }

        logToDebugFile(`[SYNC] Finalizado. Total Logs: ${totalLogs}, Nuevos: ${newRecords}`);
        return {
            success: true,
            totalLogs,
            newRecords,
            updatedMachines
        };
    } catch (error: any) {
        console.error("[SYNC] Error global:", error);
        logToDebugFile(`[SYNC] Error global: ${error.message}`);
        throw error;
    }
}

async function syncWithPython(ip: string, port: number, password: number = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos máximo por reloj

    try {
        const res = await fetch(`http://127.0.0.1:8005/sync?ip=${ip}&port=${port}&password=${password}`, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await res.json();
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return { success: false, error: 'TIMEOUT: El servicio Python no respondió o el reloj está colgado/apagado.' };
        }
        return { success: false, error: error.message };
    }
}

export async function procesarRegistroDoble(log: BiometricLog & { name?: string }, machineOid: string, employeeCache?: Map<string, any>): Promise<{ created: boolean, employeeOid: string | null, dayISO: string | null }> {
    let createdNew = false;
    let employeeOid: string | null = null;
    let dayISO: string | null = null;

    // 1. Buscar empleado Legacy (Estrategia Manual con Cache)
    const userIdInt = parseInt(log.deviceUserId);
    const userIdStr = log.deviceUserId;
    const cacheKey = `EMP_${userIdStr}`;

    let emp = null;
    let personDoc = null; // Para logging

    // Revisar Cache
    if (employeeCache && employeeCache.has(cacheKey)) {
        const cached = employeeCache.get(cacheKey);
        emp = cached.emp;
        personDoc = cached.doc;
    } else {
        const found = await ensureEmployee(userIdStr, log.name || "", employeeCache);
        emp = found.emp;
        personDoc = found.doc;
    }

    // Log de Diagnóstico para ver por qué falla el match
    if (!emp && Math.random() > 0.95) { // Solo loguear 5% para no saturar disco, pero tener muestras
        logToDebugFile(`[MATCH-FAIL] No se encontró empleado Legacy para: ${userIdStr} (Int: ${userIdInt}).`);
    } else if (emp && Math.random() > 0.999) { // Reducir log de éxito si es masivo
        logToDebugFile(`[MATCH-OK] Encontrado: ${emp.AcNumber} / ${personDoc} para entrada ${userIdStr}`);
    }

    // 2. Buscar empleado Personnel
    const pEmp = await prisma.personnel_employee.findFirst({
        where: { emp_code: log.deviceUserId }
    });

    if (!emp && !pEmp) {
        console.warn(`[SYNC-WARN] No se encontró empleado (Legacy/Personnel) para ID: ${log.deviceUserId} (UID: ${log.uid}). Guardando solo log crudo.`);
    }

    const normalizedTime = log.recordTime;



    // --- IMPACTO 1: checkinout (Legacy) ---
    if (emp) {
        // VALIDACIÓN: Evitar duplicados por doble marcación (gracia de 1 minuto)
        const graceStart = new Date(normalizedTime.getTime() - 60000);
        const graceEnd = new Date(normalizedTime.getTime() + 60000);

        const existeCheck = await prisma.checkinout.findFirst({
            where: { 
                Employee: emp.Oid, 
                CheckTime: {
                    gte: graceStart,
                    lte: graceEnd
                }
            }
        });


        if (!existeCheck) {
            try {
                // OPCIÓN B (Refinada): Interceptación y Limpieza de Datos
                // 1. Detectar si 'activity' es en realidad un VerifyCode (15, 16, etc.)
                const safeActivity = log.activity ?? 0;
                let finalCheckType = safeActivity;
                let finalVerifyCode = 1; // Default

                if (safeActivity > 5) {
                    finalVerifyCode = safeActivity; // Movemos el valor "erróneo" a VerifyCode
                    // Ahora CheckType queda ambiguo. Usaremos la heurística para definirlo.
                }

                // 2. Heurística de Corrección de CheckType
                // Si el CheckType es 1 (Salida), o >5 (VerifyCode), evaluamos el contexto.
                // Si es el PRIMER registro del día -> Forzamos ENTRADA (0).
                // Si YA EXISTEN registros hoy -> Forzamos SALIDA (1) (Asumiendo paridad).

                // MEJORA: Lógica Cronológica Estricta
                // En lugar de confiar en el botón que presiona el usuario (Entry/Exit),
                // usamos el historial del día para determinar qué debería ser.

                const recDate = new Date(normalizedTime);
                const startOfDay = new Date(Date.UTC(recDate.getUTCFullYear(), recDate.getUTCMonth(), recDate.getUTCDate(), 0, 0, 0));
                const endOfDay = new Date(Date.UTC(recDate.getUTCFullYear(), recDate.getUTCMonth(), recDate.getUTCDate(), 23, 59, 59));

                // Obtener todos los fichajes de HOY para este empleado
                const registrosHoy = await prisma.checkinout.findMany({
                    where: {
                        Employee: emp.Oid,
                        CheckTime: { gte: startOfDay, lte: endOfDay }
                    },
                    orderBy: { CheckTime: 'asc' }
                });

                const countToday = registrosHoy.length;
                // Normalización preliminar de códigos de verificación (>5)
                if (finalCheckType > 5) {
                    // Si es un código especial (ej. 15), asumimos momentáneamente Entrada (0)
                    // pero dejamos que las reglas abajo lo cambien si es necesario.
                    finalCheckType = 0;
                }

                if (countToday === 0) {
                    // REGLA 1: El PRIMER registro del día SIEMPRE es Entrada (0).
                    // No importa si marcó Salida, Break, etc.
                    if (finalCheckType !== 0) {
                        console.log(`[SYNC-FIX] Forzando Entrada (0) para ${emp.Oid} (Original: ${log.activity}) - Primer registro del día.`);
                        finalCheckType = 0;
                    }
                } else {
                    // REGLA 2: Registros posteriores.
                    const ultimoRegistro = registrosHoy[registrosHoy.length - 1];

                    if (ultimoRegistro.CheckTime) {
                        const diffMinutos = (normalizedTime.getTime() - ultimoRegistro.CheckTime.getTime()) / 60000;

                        // Si tenemos una Entrada previa abierta (CheckType 0)
                        if (ultimoRegistro.CheckType === 0) {
                            // Y han pasado más de 1 hora (60 min)
                            if (diffMinutos > 60) {
                                // Debería ser una SALIDA para cerrar el turno.
                                if (finalCheckType !== 1) {
                                    console.log(`[SYNC-FIX] Forzando Salida (1) para ${emp.Oid}. (Original: ${log.activity}, Diff: ${diffMinutos.toFixed(0)}m desde entrada).`);
                                    finalCheckType = 1;
                                }
                            } else {
                                // Si es < 1 hora, podría ser un duplicado o un re-intento de entrada.
                            }
                        } else {
                            // El último fue Salida (1). Estamos abriendo un NUEVO turno en el mismo día.
                            // Debería ser Entrada (0).
                            if (finalCheckType !== 0) {
                                console.log(`[SYNC-FIX] Forzando Entrada (0) para ${emp.Oid} (Original: ${log.activity}) - Apertura de segundo turno.`);
                                finalCheckType = 0;
                            }
                        }
                    }
                }

                await prisma.checkinout.create({
                    data: {
                        Oid: crypto.randomUUID(),
                        CheckTime: normalizedTime,
                        CheckType: finalCheckType,
                        Employee: emp.Oid,
                        Machine: machineOid,
                        VerifyCode: finalVerifyCode
                    }
                });
                createdNew = true;
            } catch (error: any) {
                if (error.code === 'P2002') {
                    // Ignorar duplicado
                } else {
                    throw error;
                }
            }
        }
    }

    // --- IMPACTO 2: iclock_transaction (Siempre) ---
    const tGraceStart = new Date(normalizedTime.getTime() - 60000);
    const tGraceEnd = new Date(normalizedTime.getTime() + 60000);

    const existeTrans = await prisma.iclock_transaction.findFirst({
        where: { 
            emp_code: log.deviceUserId, 
            punch_time: {
                gte: tGraceStart,
                lte: tGraceEnd
            }
        }
    });

    if (!existeTrans) {
        try {
            await prisma.iclock_transaction.create({
                data: {
                    emp_code: log.deviceUserId,
                    punch_time: normalizedTime,
                    punch_state: String(log.activity ?? 0),
                    verify_type: 1,
                    terminal_sn: machineOid.substring(0, 20),
                    emp_id: pEmp ? pEmp.id : null,
                    is_attendance: 1,
                    upload_time: new Date()
                }
            });
            // Si no había legacy, marcamos que se creó "algo" nuevo
            if (!emp) createdNew = true;
        } catch (error: any) {
            // Manejo silencioso de Race Condition (P2002 = Unique Constraint Failed)
            if (error.code === 'P2002') {
                // Ya existe, ignoremos el error
                // console.warn(`[SYNC-RACE] Registro duplicado detectado al insertar: ${log.deviceUserId} @ ${normalizedTime}`);
            } else {
                throw error; // Otros errores sí son graves
            }
        }
    }

    if (!emp) return { created: createdNew, employeeOid: null, dayISO: null };

    // --- IMPACTO 3: marking (Consolidación - Solo Legacy) ---
    // Inicio de día literal (T00:00:00.000Z) para consistencia total en DB
    const inicioDia = new Date(normalizedTime);
    inicioDia.setUTCHours(0, 0, 0, 0);

    let marking = await prisma.marking.findFirst({
        where: {
            Employee: emp.Oid,
            Day: inicioDia // Match exacto con el día literal (T00:00:00Z)
        }
    });

    logToDebugFile(`[SYNC-SEARCH] Emp: ${emp.AcNumber}, Date: ${normalizedTime.toISOString()}, DaySearch: ${inicioDia.toISOString()} -> ${marking ? 'FOUND' : 'NULL'}`);

    // FAILSAFE: Si no encuentra por día exacto, buscar por rango de fecha (MarkingIn dentro del día UTC)
    // Esto previene duplicados si la columna Day tiene disparidad o si se quiere garantizar unicidad diaria.
    if (!marking) {
        const endOfDay = new Date(inicioDia);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        marking = await prisma.marking.findFirst({
            where: {
                Employee: emp.Oid,
                MarkingIn: {
                    gte: inicioDia,
                    lt: new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });
        logToDebugFile(`[SYNC-FAILSAFE] Emp: ${emp.AcNumber}, Range: ${inicioDia.toISOString()} - ${endOfDay.toISOString()} -> ${marking ? 'FOUND' : 'NULL'}`);
    }

    if (!marking) {
        // Lógica de "Primer Golpe = Entrada":
        // Si no hay marcación para este día, creamos una nueva ASUMIENDO que este primer registro es la ENTRADA,
        // sin importar qué CheckType/Activity envíe el dispositivo (0, 1, 15, etc.).
        // Esto corrige casos donde dispositivos mal configurados envían 'Salida' (1) como primer fichaje del día.
        logToDebugFile(`[SYNC-CREATE] Creando nueva marking para Emp: ${emp.AcNumber}`);
        try {
            // Obtener turno y ciclo del empleado
            const shiftOid = (emp as any).CurrentShift || null;
            const cycle = (emp as any).CurrentCycle || null;

            await prisma.marking.create({
                data: {
                    Oid: crypto.randomUUID(),
                    Employee: emp.Oid,
                    Day: inicioDia,
                    MarkingIn: normalizedTime,
                    Status: 1, // Default Normal
                    Shift: shiftOid,
                    Cycle: cycle,
                    StartShiftMarkingIn: false,
                    OverTimeBeforeEntry: false,
                    OverTimeAfterExit: false,
                    OverTimeInHoliday: false,
                    Approve: false
                }
            });
        } catch (error: any) {
            // Si falla por duplicado (P2002), es que se creó en paralelo, intentamos update abajo
            if (error.code !== 'P2002') throw error;
        }
    } else {
        // Si ya existe la marcación:
        // - Si el log es SALIDA (1) -> Actualizamos MarkingOut
        // - Si el log es ENTRADA (0) -> No deberíamos sobreescribir MarkingIn (ya está), salvo update forzado? 
        //   (Dejamos la lógica actual que actualiza MarkingOut si es posterior, pero la restringimos a Exits o logs posteriores)

        // Lógica Mejorada:
        // Lógica Mejorada:
        if (log.activity === 1) {
            // Es explícitamente una salida

            // GUARD: Evitar "Auto-Cierre" por reprocesamiento del mismo log.
            // Si el tiempo de salida es casi idéntico al de entrada (ej. < 60 segundos),
            // asumimos que es el MISMO fichaje que creó la entrada (por la lógica de "Primer Golpe"),
            // y lo ignoramos como salida.
            const diffSeconds = marking.MarkingIn ? (normalizedTime.getTime() - marking.MarkingIn.getTime()) / 1000 : 9999;

            if (diffSeconds > 1200) {
                if (!marking.MarkingOut || normalizedTime > marking.MarkingOut) {
                    await prisma.marking.update({
                        where: { Oid: marking.Oid },
                        data: { MarkingOut: normalizedTime }
                    });
                }
            }
        } else {
            // Es entrada (0). 
            // NUEVA LÓGICA (Petición Usuario):
            // "si ya tiene una marcacion de entrada y la segunda marcacion es de entrada esta sea verificada y aparezca como salida"

            // Verificamos si podemos usar esta "Entrada Tardía" para cerrar el turno.
            // VERIFICAR MINIMO 1 HORA (60 minutos)
            const diffMinutos = marking.MarkingIn ? (normalizedTime.getTime() - marking.MarkingIn.getTime()) / 60000 : 0;

            // Debug Log
            logToDebugFile(`[SYNC-CHECK] Empleado ${emp.AcNumber}: Revisando cierre. Diff: ${diffMinutos.toFixed(1)} min. Existente Out: ${marking.MarkingOut || 'NULL'}`);

            if (!marking.MarkingOut || normalizedTime > marking.MarkingOut) {
                if (diffMinutos > 60) {
                    logToDebugFile(`[SYNC-UPDATE] Cerrando turno para ${emp.AcNumber}. Diff > 60 min.`);
                    await prisma.marking.update({
                        where: { Oid: marking.Oid },
                        data: { MarkingOut: normalizedTime }
                    });
                } else {
                    logToDebugFile(`[SYNC-IGNORE] Entrada cercana (${diffMinutos.toFixed(1)} min) ignorada para evitar cierre prematuro (Req: 60 min).`);
                }
            }
        }
    }

    if (emp) {
        employeeOid = emp.Oid;
        dayISO = inicioDia.toISOString();
    }

    return { created: createdNew, employeeOid, dayISO };
}

export async function ensureEmployee(userIdStr: string, name: string, employeeCache?: Map<string, any>): Promise<{ emp: any, doc: string | null }> {
    const userIdInt = parseInt(userIdStr);
    const cacheKey = `EMP_${userIdStr}`;

    // 1. Revisar Cache
    if (employeeCache && employeeCache.has(cacheKey)) {
        return employeeCache.get(cacheKey);
    }

    let emp = null;
    let personDoc = null;

    // A. Intentar por AcNumber
    if (!isNaN(userIdInt)) {
        emp = await prisma.employee.findFirst({
            where: { AcNumber: userIdInt },
            orderBy: [
                { CurrentShift: 'desc' },
                { Department: 'desc' }
            ]
        });
    }

    // B. FALLBACK: Intentar por Documento en Person (si no se encontró por AcNumber)
    if (!emp && userIdStr) {
        const p = await prisma.eperson.findFirst({
            where: { Document: userIdStr }
        });
        if (p) {
            personDoc = p.Document;
            emp = await prisma.employee.findUnique({
                where: { Oid: p.Oid }
            });
        }
    } else if (emp) {
        // C. Si se encontró por AcNumber, traemos el documento para el log
        const p = await prisma.eperson.findUnique({
            where: { Oid: emp.Oid }
        });
        if (p) personDoc = p.Document;
    }

    // D. AUTO-CREACIÓN: Si después de todo no se encontró, crear empleado nuevo
    if (!emp && userIdStr) {
        const rawName = name || `ID ${userIdStr}`;
        logToDebugFile(`[SYNC-AUTO] Creando empleado nuevo: ${rawName} (ID: ${userIdStr})`);
        const newOid = crypto.randomUUID().toUpperCase();
        try {
            // 1. Crear eparty (Raíz de la entidad)
            await prisma.eparty.create({
                data: {
                    Oid: newOid,
                    DisplayName: rawName.toUpperCase(),
                    CreatedDate: new Date(),
                    ObjectType: 1,
                    OptimisticLockField: 0
                }
            });

            // 2. Crear eperson (Datos personales)
            await prisma.eperson.create({
                data: {
                    Oid: newOid,
                    FirstName: rawName.split(' ')[0] || 'NUEVO',
                    LastName: rawName.split(' ').slice(1).join(' ') || `ID ${userIdStr}`,
                    FullName: rawName.toUpperCase(),
                    Document: userIdStr
                }
            });

            // 3. Crear employee (Tabla Legacy)
            emp = await prisma.employee.create({
                data: {
                    Oid: newOid,
                    AcNumber: userIdInt || 0,
                    Status: 0
                }
            });

            // 4. Crear personnel_employee (Tabla Personnel)
            try {
                await (prisma as any).personnel_employee.create({
                    data: {
                        first_name: rawName.split(' ')[0] || 'NUEVO',
                        last_name: rawName.split(' ').slice(1).join(' ') || `ID ${userIdStr}`,
                        emp_code: userIdStr,
                        status: 1,
                        is_admin: false,
                        enable_att: true,
                        enable_overtime: true,
                        enable_holiday: true,
                        deleted: false,
                        is_active: true,
                        enable_payroll: true,
                        company_id: 1,
                        cost_centers_id: 1
                    }
                });
            } catch (pErr) {
                logToDebugFile(`[SYNC-AUTO-WARN] No se pudo crear personnel_employee: ${pErr}`);
            }

            personDoc = userIdStr;
        } catch (autoErr) {
            logToDebugFile(`[SYNC-AUTO-ERROR] Error creando empleado ${userIdStr}: ${autoErr}`);
        }
    }

    const result = { emp, doc: personDoc };
    if (employeeCache) {
        employeeCache.set(cacheKey, result);
    }
    return result;
}



export async function reprocessHistory(desde: Date, hasta: Date) {
    const affectedDays = new Map<string, Set<string>>(); // EmployeeOid -> Set of ISO Days
    const employeeCache = new Map<string, any>();

    try {
        console.log(`[REPROCESS] Iniciando reprocesamiento desde ${desde.toISOString()} hasta ${hasta.toISOString()}...`);

        // 1. Obtener registros crudos en el rango
        const logsRaw = await prisma.checkinout.findMany({
            where: {
                CheckTime: {
                    gte: desde,
                    lte: hasta
                }
            },
            orderBy: { CheckTime: 'asc' }
        });

        console.log(`[REPROCESS] Encontrados ${logsRaw.length} registros en checkinout.`);

        // 2. Procesar cada registro para reconstruir 'marking'
        for (const log of logsRaw) {
            if (!log.CheckTime || !log.Employee) continue;

            const biometricLog: any = {
                uid: 0,
                userSn: 0,
                deviceUserId: "", // Lo buscaremos por el Oid del empleado si es necesario, 
                // pero procesarRegistroDoble tiene una lógica para buscar empleado por Oid si le pasamos el contexto.
                recordTime: log.CheckTime,
                activity: log.CheckType ?? 0,
                name: ""
            };

            // Necesitamos el AcNumber o el emp_code para que procesarRegistroDoble funcione bien.
            // Vamos a optimizar: procesarRegistroDoble busca el empleado. 
            // Si ya tenemos el Employee Oid del log de checkinout, podemos simplificar o adaptar.
            
            // Buscamos el empleado para obtener su AcNumber
            const empKey = `EMP_OID_${log.Employee}`;
            let emp;
            if (employeeCache.has(empKey)) {
                emp = employeeCache.get(empKey);
            } else {
                emp = await prisma.employee.findUnique({ where: { Oid: log.Employee } });
                employeeCache.set(empKey, emp);
            }

            if (!emp) continue;

            const result = await procesarRegistroDoble({
                ...biometricLog,
                deviceUserId: String(emp.AcNumber || ""),
            }, log.Machine || "MIGRACION", employeeCache);

            if (result.employeeOid && result.dayISO) {
                if (!affectedDays.has(result.employeeOid)) {
                    affectedDays.set(result.employeeOid, new Set());
                }
                affectedDays.get(result.employeeOid)!.add(result.dayISO);
            }
        }

        // 3. Ejecutar el Engine para los días afectados
        console.log(`[REPROCESS] Iniciando cálculo de motor para ${affectedDays.size} empleados...`);
        let processedCount = 0;

        for (const [empOid, days] of affectedDays.entries()) {
            for (const dayISO of days) {
                try {
                    const date = new Date(dayISO);
                    await laborEngine.processDay(empOid, date);
                    processedCount++;
                } catch (engErr) {
                    console.error(`[REPROCESS-ERROR] Error en ${empOid} el ${dayISO}:`, engErr);
                }
            }
        }

        console.log(`[REPROCESS] Finalizado. Marcaciones procesadas: ${logsRaw.length}, Días calculados: ${processedCount}`);
        return {
            success: true,
            logsProcesados: logsRaw.length,
            diasCalculados: processedCount,
            empleadosAfectados: affectedDays.size
        };

    } catch (error: any) {
        console.error("[REPROCESS] Error global:", error);
        throw error;
    }
}
