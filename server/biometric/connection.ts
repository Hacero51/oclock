// @ts-ignore
import ZKLib from 'zklib-js';
import { BiometricDevice, BiometricLog } from './types';

export class BiometricConnection {
    private device: BiometricDevice;
    private zkInstance: any;

    constructor(device: BiometricDevice) {
        this.device = device;
    }

    async connect(): Promise<boolean> {
        try {
            // Aumentamos los timeouts para VPN
            this.zkInstance = new ZKLib(this.device.ip, this.device.port, 20000, 20000);

            // Si hay password, intentamos establecerlo
            // Si hay password, intentamos establecerlo en la propiedad 'pin' que usa nuestro parche
            if (this.device.password) {
                if (typeof this.zkInstance.setKey === 'function') {
                    this.zkInstance.setKey(this.device.password);
                }

                // Parche para pasar el PIN al driver TCP modificado
                if (this.zkInstance.zklibTcp) {
                    this.zkInstance.zklibTcp.pin = this.device.password;
                }
            }

            await this.zkInstance.createSocket();
            return true;
        } catch (error: any) {
            console.error(`Error conectando a ${this.device.name} (${this.device.ip}):`, error.code || error.message);
            return false;
        }
    }

    async getLogs(): Promise<BiometricLog[]> {
        if (!this.zkInstance) return [];

        try {
            // La librería zklib-js usa getAttendances (en plural)
            let logs: any = null;
            if (typeof (this.zkInstance as any).getAttendances === 'function') {
                logs = await (this.zkInstance as any).getAttendances();
            } else if (typeof (this.zkInstance as any).getAttendance === 'function') {
                logs = await (this.zkInstance as any).getAttendance();
            } else if (typeof (this.zkInstance as any).getAttendanceLog === 'function') {
                logs = await (this.zkInstance as any).getAttendanceLog();
            }

            console.log(`[ZK-DEBUG] Response structure from ${this.device.name}:`, logs ? Object.keys(logs) : 'null');

            if (!logs || (!logs.data && !Array.isArray(logs))) {
                console.log(`[ZK-DEBUG] No data array found in response from ${this.device.name}`);
                return [];
            }

            const dataArray = Array.isArray(logs) ? logs : logs.data;
            console.log(`[ZK-DEBUG] Extracted ${dataArray.length} logs from ${this.device.name}`);

            return dataArray.map((log: any) => ({
                deviceUserId: log.deviceUserId || log.userId,
                recordTime: new Date(log.recordTime || log.timestamp),
                userSn: log.userSn,
                ip: this.device.ip
            }));
        } catch (error) {
            console.error(`Error obteniendo logs de ${this.device.name}:`, error);
            return [];
        }
    }

    async startRealTimeLogs(callback: (log: BiometricLog) => void) {
        if (!this.zkInstance) return;

        try {
            await this.zkInstance.getRealTimeLogs((log: any) => {
                if (log) {
                    callback({
                        deviceUserId: log.deviceUserId || log.userId,
                        recordTime: new Date(log.recordTime || log.timestamp),
                        userSn: log.userSn,
                        ip: this.device.ip
                    });
                }
            });
            console.log(`[ZK-RT] Escucha en tiempo real iniciada para ${this.device.name}`);
        } catch (error) {
            console.error(`[ZK-RT] Error en tiempo real para ${this.device.name}:`, error);
        }
    }

    async disconnect() {
        if (this.zkInstance) {
            try {
                await this.zkInstance.disconnect();
            } catch (error) {
                console.error(`Error al desconectar ${this.device.name}:`, error);
            }
        }
    }
}
