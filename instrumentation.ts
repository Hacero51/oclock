export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[INSTRUMENTATION] Iniciando servicios de background...');

        try {
            // Importación dinámica para evitar problemas de orden de carga
            const { rtSyncService } = await import('./server/biometric/realtime');
            rtSyncService.start();
            console.log('[INSTRUMENTATION] Servicio de sincronización biométrica iniciado.');
        } catch (err) {
            console.error('[INSTRUMENTATION] Error iniciando servicios:', err);
        }
    }
}
