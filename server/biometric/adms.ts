import prisma from "@/lib/prisma";
import crypto from "crypto";

// --- Tipos de Datos ADMS ---
// El dispositivo envía datos en formato de texto.
// Ejemplo: POST con body "SN=123&CreateTime=...&Stamp=..."

export class ADMSService {

    /**
     * Procesa la solicitud de 'handshake' inicial o heartbeat.
     * Ruta: /iclock/cdata?SN=...&options=all
     */
    async handleHandshake(urlParams: URLSearchParams, bodyResult: string) {
        const sn = urlParams.get('SN') || '';
        console.log(`[ADMS] Handshake recibido de ${sn}`);

        // Aquí podríamos registrar el dispositivo si no existe
        // o actualizar su "LastSeen".
        if (sn) {
            await this.updateDeviceStatus(sn);
        }

        return "OK";
    }

    /**
     * Procesa los registros de asistencia (AttLog).
     * El dispositivo envía un POST a /iclock/cdata con tabla 'ATTLOG'.
     * Body format: ID w\tPIN\tVerified\tTime\tStatus\tWorkCode...
     */
    async processAttendanceLogs(data: string, sn: string) {
        console.log(`[ADMS] Procesando logs de ${sn}...`);

        const lines = data.split('\n');
        let processedCount = 0;

        // Buscamos el OID de la máquina
        // 1. Intentar buscar por SerialNumber exacto en machinezk
        const zkMachine = await prisma.machinezk.findFirst({
            where: { SerialNumber: sn }
        });

        let machineOid = zkMachine?.Oid;

        // 2. Si no match, buscar en la tabla machine por Name o Oid (fallback)
        if (!machineOid) {
            const machine = await prisma.machine.findFirst({
                where: { OR: [{ Name: sn }, { Oid: { contains: sn } }, { Name: { contains: sn } }] }
            });
            machineOid = machine?.Oid;
        }

        if (!machineOid) {
            console.warn(`[ADMS] Dispositivo no reconocido: ${sn}. Usando 'UNKNOWN_DEVICE'.`);
            machineOid = 'UNKNOWN_DEVICE';
        }

        for (const line of lines) {
            if (!line.trim()) continue;

            // Formato típico ZK ADMS:
            // 999 2023-10-27 08:30:00 0 1 0 0 0
            // PIN Time State Verify WorkCode ...
            // O a veces viene separado por \t (tabs)
            const parts = line.split(/\s+/);
            if (parts.length < 2) continue;

            const userId = parts[0];
            const timestampStr = parts[1] + ' ' + parts[2]; // Fecha + Hora
            const state = parts[3];
            const verify = parts[4];

            const recordTime = new Date(timestampStr);

            if (isNaN(recordTime.getTime())) continue;

            await this.saveAttendance(userId, recordTime, machineOid, sn, state, verify);
            processedCount++;
        }

        console.log(`[ADMS] ${processedCount} registros procesados de ${sn}.`);
        return `OK: ${processedCount}`;
    }

    /**
     * Guarda el registro usando la lógica de "Doble Impacto" existente
     */
    /**
     * Guarda el registro usando la lógica de "Doble Impacto" existente
     */
    private async saveAttendance(userId: string, recordTime: Date, machineOid: string, sn: string, state: string, verify: string) {
        // 1. Buscar empleado (Legacy)
        let emp = await prisma.employee.findFirst({
            where: { AcNumber: parseInt(userId) }
        });

        if (!emp) {
            const p = await prisma.eperson.findFirst({
                where: { Document: userId }
            });
            if (p) {
                emp = await prisma.employee.findFirst({
                    where: { Oid: p.Oid }
                });
            }
        }

        // 2. Buscar empleado (Personnel/ZK)
        const pEmp = await prisma.personnel_employee.findFirst({
            where: { emp_code: userId }
        });

        if (!emp && !pEmp) {
            console.warn(`[ADMS] Empleado no encontrado (ni Legacy ni Personnel) para ID: ${userId} (SN: ${sn})`);
        }

        const normalizedTime = recordTime;
        normalizedTime.setMilliseconds(0);

        const checkTypeInt = parseInt(state) || 0; // 0=In, 1=Out, etc.

        // --- IMPACTO 1: checkinout (Solo si existe emp Legacy) ---
        if (emp) {
            const existsCheck = await prisma.checkinout.findFirst({
                where: { Employee: emp.Oid, CheckTime: normalizedTime }
            });

            if (!existsCheck) {
                // OPCIÓN B (Refinada): Interceptación y Limpieza
                let finalCheckType = checkTypeInt;
                let finalVerifyCode = parseInt(verify) || 1;

                // 1. Detectar VerifyCode en la actividad/estado
                if (checkTypeInt > 5) {
                    finalVerifyCode = checkTypeInt;
                    // CheckType queda ambiguo (ej: 15).
                }

                // 2. Heurística Entrada/Salida
                if (finalCheckType === 1 || finalCheckType > 5) {
                    const recDate = new Date(normalizedTime);
                    const startOfDay = new Date(Date.UTC(recDate.getUTCFullYear(), recDate.getUTCMonth(), recDate.getUTCDate(), 0, 0, 0));
                    const endOfDay = new Date(Date.UTC(recDate.getUTCFullYear(), recDate.getUTCMonth(), recDate.getUTCDate(), 23, 59, 59));

                    const countToday = await prisma.checkinout.count({
                        where: { Employee: emp.Oid, CheckTime: { gte: startOfDay, lte: endOfDay } }
                    });

                    if (countToday === 0) {
                        if (finalCheckType !== 0) {
                            console.log(`[ADMS-FIX] Forzando Entrada (0) para ${emp.Oid} (Original: ${checkTypeInt})`);
                            finalCheckType = 0;
                        }
                    } else {
                        if (finalCheckType > 5) {
                            console.log(`[ADMS-FIX] Forzando Salida (1) para ${emp.Oid} (Original: ${checkTypeInt})`);
                            finalCheckType = 1;
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
                        VerifyCode: parseInt(verify) || 1
                    }
                });
            }
        }

        // --- IMPACTO 2: iclock_transaction (Siempre, vinculando si es posible) ---
        const existsTrans = await prisma.iclock_transaction.findFirst({
            where: { emp_code: userId, punch_time: normalizedTime }
        });

        if (!existsTrans) {
            await prisma.iclock_transaction.create({
                data: {
                    emp_code: userId,
                    punch_time: normalizedTime,
                    punch_state: state,
                    verify_type: parseInt(verify),
                    terminal_sn: sn,
                    emp_id: pEmp?.id || null,
                    is_attendance: 1,
                    upload_time: new Date()
                }
            });
        }

        // --- IMPACTO 3: marking (Consolidación) - Solo si existe emp Legacy ---
        if (emp) {
            // FIX: Uso estricto de UTC para el inicio del día, igual que en sync.ts
            const year = normalizedTime.getUTCFullYear();
            const month = normalizedTime.getUTCMonth();
            const day = normalizedTime.getUTCDate();
            const inicioDia = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

            let marking = await prisma.marking.findFirst({
                where: { Employee: emp.Oid, Day: inicioDia }
            });

            // FAILSAFE: Si no encuentra por día exacto, buscar por rango de fecha (MarkingIn dentro del día UTC)
            if (!marking) {
                const endOfDay = new Date(inicioDia);
                endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

                marking = await prisma.marking.findFirst({
                    where: {
                        Employee: emp.Oid,
                        MarkingIn: {
                            gte: inicioDia,
                            lt: endOfDay
                        }
                    }
                });
            }

            if (!marking) {
                // Lógica de "Primer Golpe = Entrada":
                // Si no hay marcación para este día, creamos una nueva ASUMIENDO que este primer registro es la ENTRADA,
                // sin importar qué CheckType/Status envíe el dispositivo (0, 1, 15, etc.).
                // Esto permite que el primer fichaje del día siempre abra turno, aunque el usuario marque 'Salida' por error.

                // Obtener turno y ciclo (simulado, idealmente deberíamos traerlo de emp)
                const shiftOid = (emp as any).CurrentShift || null;
                const cycle = (emp as any).CurrentCycle || null;

                await prisma.marking.create({
                    data: {
                        Oid: crypto.randomUUID(),
                        Employee: emp.Oid,
                        Shift: shiftOid,
                        Cycle: cycle,
                        Day: inicioDia,
                        MarkingIn: normalizedTime,
                        Status: 1,
                        StartShiftMarkingIn: false,
                        OverTimeBeforeEntry: false,
                        OverTimeAfterExit: false,
                        OverTimeInHoliday: false,
                        Approve: false
                    }
                });
            } else {
                // Si ya existe:
                // Si es Salida (1) -> Actualizar MarkingOut
                // Si es Salida (1) -> Actualizar MarkingOut
                if (checkTypeInt === 1) {
                    // GUARD: Evitar "Auto-Cierre" por reprocesamiento (mismo timestamp que entrada)
                    if (marking.MarkingIn) {
                        const diffSeconds = (normalizedTime.getTime() - marking.MarkingIn.getTime()) / 1000;


                        if (diffSeconds > 1200) {
                            if (!marking.MarkingOut || normalizedTime > marking.MarkingOut) {
                                await prisma.marking.update({
                                    where: { Oid: marking.Oid },
                                    data: { MarkingOut: normalizedTime }
                                });
                            }
                        }
                    }
                }
                // Si es Entrada (0) -> Ignorar (ya tenemos MarkingIn), no sobrescribir, 
                // para mantener la primera entrada del día.
            }
        }
    }

    private async updateDeviceStatus(sn: string) {
        // Actualizar LastDownload / Status del dispositivo
        // Intentamos buscar por coincidencia de nombre o creamos uno "fantasma" si es necesario
        // Por ahora solo logging
        console.log(`[ADMS] Dispositivo Activo: ${sn}`);
    }
}

export const admsService = new ADMSService();
