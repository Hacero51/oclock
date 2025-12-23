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
    private async saveAttendance(userId: string, recordTime: Date, machineOid: string, sn: string, state: string, verify: string) {
        // 1. Buscar empleado (Legacy)
        const emp = await prisma.employee.findFirst({
            where: { OR: [{ AcNumber: parseInt(userId) }, { person: { Document: userId } }] },
            include: { person: true }
        });

        // 2. Buscar empleado (Personnel/ZK)
        const pEmp = await prisma.personnel_employee.findFirst({
            where: { emp_code: userId }
        });

        if (!emp && !pEmp) {
            console.warn(`[ADMS] Empleado no encontrado (ni Legacy ni Personnel) para ID: ${userId} (SN: ${sn})`);
            // Podríamos guardar en iclock_transaction aun sin empleado vinculado, pero depende de la lógica de negocio.
            // Asumiremos que si no existe en ningun lado, es un registro huérfano que igual queremos ver en logs crudos?
            // Para seguridad, guardemos el iclock_transaction siempre que haya userId.
        }

        const normalizedTime = recordTime; // Ya viene parseado
        normalizedTime.setMilliseconds(0);

        // --- IMPACTO 1: checkinout (Solo si existe emp Legacy) ---
        if (emp) {
            const existsCheck = await prisma.checkinout.findFirst({
                where: { Employee: emp.Oid, CheckTime: normalizedTime }
            });

            if (!existsCheck) {
                await prisma.checkinout.create({
                    data: {
                        Oid: crypto.randomUUID(),
                        CheckTime: normalizedTime,
                        CheckType: parseInt(state) || 0,
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
            const inicioDia = new Date(normalizedTime);
            inicioDia.setHours(0, 0, 0, 0);

            const marking = await prisma.marking.findFirst({
                where: { Employee: emp.Oid, Day: inicioDia }
            });

            if (!marking) {
                await prisma.marking.create({
                    data: {
                        Oid: crypto.randomUUID(),
                        Employee: emp.Oid,
                        Day: inicioDia,
                        MarkingIn: normalizedTime,
                        Status: 1
                    }
                });
            } else {
                // Actualizar salida si es posterior
                if (!marking.MarkingOut || normalizedTime > marking.MarkingOut) {
                    const diff = (normalizedTime.getTime() - (marking.MarkingIn?.getTime() || 0)) / 60000;
                    if (diff > 5) { // Evitar rebote
                        await prisma.marking.update({
                            where: { Oid: marking.Oid },
                            data: { MarkingOut: normalizedTime }
                        });
                    }
                }
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
