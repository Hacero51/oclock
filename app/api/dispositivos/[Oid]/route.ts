import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ Oid: string }> }) {
    const params = await props.params;
    try {
        const { Oid } = params;

        const machine = await prisma.machine.findUnique({
            where: { Oid: Oid }
        });

        if (!machine) {
            return NextResponse.json({ error: "Dispositivo no encontrado" }, { status: 404 });
        }

        const details = await prisma.machinezk.findUnique({
            where: { Oid: Oid }
        });

        // Combinar datos
        const data = {
            id: machine.MachineNumber || machine.Oid,
            oid: machine.Oid,
            nombre: machine.Name,
            fechaDispositivo: details?.DeviceTime?.toISOString().split('T')[0] || '', // Formato YYYY-MM-DD
            ip: details?.IP || '',
            puerto: details?.Port || 4370,
            softwareVersion: details?.Firmware || '', // Usamos Firmware como version por defecto
            tipoConexion: details?.ConnectType === 1 ? 'serial' : 'red', // Ajustar lógica según valores reales
            baudRate: details?.BaudRate || '115200',
            contraseña: details?.Password || '',
            puertoSerial: details?.SerialPort || 0,

            // Capacidades
            capacidadUsuarios: details?.UserCount || 0,
            capacidadRegistros: details?.LogCount || 0,
            capacidadHuellas: details?.FingerprintCount || 0,
            capacidadRostros: details?.FaceCount || 0,

            // Capacidades Máximas (Asumiendo campos si existen, sino defaults)
            cantidadMaximaUsuarios: details?.MaximumQtyUsers || 3000,
            cantidadMaximaRegistros: details?.MaximumQtyLogs || 100000,
            cantidadMaximaHuellas: details?.MaximumQtyFingerprints || 3000,
            cantidadMaximaRostros: details?.MaximumQtyFaces || 1000,

            // Otros
            cantidadadministrador: details?.AdministratorCount || 0,
            cantidadcontrasena: details?.PasswordCount || 0,
            firware: details?.Firmware || '',
            serie: details?.SerialNumber || '',
            versionfingerprint: details?.FingerprintVersion || '',
            longitudNumeroLector: details?.AcNumberLength || 9,

            estadoConexion: machine.ConnectionStatus === 1 ? 'Conectado' : 'Desconectado',
            estado: machine.Status === 1 ? 'Activo' : 'Inactivo'
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error obteniendo dispositivo:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ Oid: string }> }) {
    const params = await props.params;
    try {
        const { Oid } = params;
        const body = await request.json();

        // Validar existencia
        const existingMachine = await prisma.machine.findUnique({
            where: { Oid: Oid }
        });

        if (!existingMachine) {
            return NextResponse.json({ error: "Dispositivo no encontrado" }, { status: 404 });
        }

        // Actualizar Machine
        await prisma.machine.update({
            where: { Oid: Oid },
            data: {
                Name: body.nombre,
                // MachineNumber no siempre es editable o requerido, dependerá de la lógica de negocio
            }
        });

        // Actualizar o Crear MachineZK
        // Primero intentamos buscar si existe para hacer update, sino create no es directo aquí porque Oid es FK
        const existingDetails = await prisma.machinezk.findUnique({ where: { Oid: Oid } });

        const detailsData = {
            IP: body.ip,
            Port: parseInt(body.puerto),
            Firmware: body.firware, // map from form 'firware'
            SerialNumber: body.serie,
            FingerprintVersion: body.versionfingerprint,
            // Mapping de otros campos técnicos si se permite editarlos
            // Por seguridad, muchos campos de capacidad son de solo lectura desde el dispositivo hacia la BD
            // pero permitiremos editar los de conexión
        };

        if (existingDetails) {
            await prisma.machinezk.update({
                where: { Oid: Oid },
                data: detailsData
            });
        } else {
            // Si no existe registro ZK para esta máquina, lo creamos
            await prisma.machinezk.create({
                data: {
                    Oid: Oid,
                    ...detailsData
                }
            });
        }

        return NextResponse.json({ success: true, message: "Dispositivo actualizado correctamente" });

    } catch (error) {
        console.error("Error actualizando dispositivo:", error);
        return NextResponse.json({ error: "Error al actualizar dispositivo" }, { status: 500 });
    }
}
