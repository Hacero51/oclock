import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sincronizarRelojes } from "./sync";

/**
 * Servicio de Sincronización Programada (Polling).
 * En lugar de mantener una conexión inestable "Push", ejecutamos la sincronización
 * estándar periódicamente para simular tiempo real robusto.
 */
class ScheduledSyncService {
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning: boolean = false;
    public isSyncing: boolean = false;
    private lastSyncStart: number = 0;
    private readonly INTERVAL_MS = 60000; // 1 minuto
    private readonly FORCE_UNLOCK_MS = 15 * 60 * 1000; // 15 minutos

    public get isActive(): boolean {
        return this.intervalId !== null;
    }

    start() {
        if (this.intervalId) return;

        console.log(`[POLLING] Iniciando sincronización automática cada ${this.INTERVAL_MS / 1000}s...`);

        // Ejecutar inmediatamente al inicio
        this.runSyncSafe();

        this.intervalId = setInterval(() => {
            this.runSyncSafe();
        }, this.INTERVAL_MS);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[POLLING] Servicio detenido.');
        }
        return { success: true };
    }

    private async runSyncSafe() {
        const now = Date.now();

        // Mecanismo de seguridad: Si lleva "pegado" más de 15 mins, desbloquear a la fuerza
        if (this.isSyncing && (now - this.lastSyncStart > this.FORCE_UNLOCK_MS)) {
            console.warn('[POLLING] ALERTA: La sincronización anterior parece trabada. Forzando desbloqueo...');
            this.isSyncing = false;
        }

        if (this.isSyncing) {
            console.log('[POLLING] Sincronización anterior aún en proceso, omitiendo...');
            return;
        }

        this.isSyncing = true;
        this.lastSyncStart = now;
        console.log('[POLLING] Ejecutando ciclo de sincronización...');

        try {
            // Sincronizar TODOS los dispositivos configurados
            const result = await sincronizarRelojes();
            console.log(`[POLLING] Ciclo completado. Logs: ${result.totalLogs}, Nuevos: ${result.newRecords}`);
        } catch (error) {
            console.error('[POLLING] Error durante ciclo de sincronización:', error);
        } finally {
            this.isSyncing = false;
        }
    }
}

export const rtSyncService = new ScheduledSyncService();
