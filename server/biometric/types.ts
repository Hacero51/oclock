export interface BiometricLog {
    userSn: number;
    deviceUserId: string;
    recordTime: Date;
    ip: string;
    uid?: number;
    activity?: number;
}

export interface BiometricDevice {
    oid: string;
    name: string;
    ip: string;
    port: number;
    password?: string;
}
