// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Tipos para mejor type safety
interface UsuarioInput {
  HiddenUserName: string;
  UserName: string;
  StoredPassword: string;
  IsActive?: boolean;
}

interface UsuarioUpdateInput extends Partial<UsuarioInput> {
  Oid: string;
}

// Configuración
const CONFIG = {
  PASSWORD_MASK: '********',
  MAX_USERNAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6
} as const;

// Utilidades
const generateHash = (password: string): string => {
  return crypto.createHash("md5").update(password).digest("hex").toUpperCase();
};

const validateUUID = (oid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(oid);
};

const validateUserInput = (data: Partial<UsuarioInput>, isCreate: boolean = false): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (isCreate) {
    if (!data.HiddenUserName?.trim()) {
      errors.push("HiddenUserName es requerido");
    }
    if (!data.UserName?.trim()) {
      errors.push("UserName es requerido");
    }
    if (!data.StoredPassword || data.StoredPassword === CONFIG.PASSWORD_MASK) {
      errors.push("StoredPassword es requerido");
    }
  }

  if (data.HiddenUserName && data.HiddenUserName.length > CONFIG.MAX_USERNAME_LENGTH) {
    errors.push(`HiddenUserName no puede exceder ${CONFIG.MAX_USERNAME_LENGTH} caracteres`);
  }

  if (data.UserName && data.UserName.length > CONFIG.MAX_USERNAME_LENGTH) {
    errors.push(`UserName no puede exceder ${CONFIG.MAX_USERNAME_LENGTH} caracteres`);
  }

  if (data.StoredPassword && data.StoredPassword !== CONFIG.PASSWORD_MASK) {
    if (data.StoredPassword.length < CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${CONFIG.MIN_PASSWORD_LENGTH} caracteres`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// GET - Para listar usuarios
export async function GET() {
  try {
    const usuarios = await prisma.euser.findMany({
      select: {
        Oid: true,
        UserName: true,
        HiddenUserName: true,
        IsActive: true,
        StoredPassword: true,
        ChangePasswordOnFirstLogon: true,
        OptimisticLockField: true
      },
      orderBy: {
        UserName: 'asc'
      }
    });

    // Transformar datos para respuesta
    const usuariosTransformados = usuarios.map(usuario => ({
      Oid: usuario.Oid,
      UserName: usuario.UserName,
      HiddenUserName: usuario.HiddenUserName,
      IsActive: usuario.IsActive ?? true,
      ChangePasswordOnFirstLogon: usuario.ChangePasswordOnFirstLogon ?? false,
      // Enmascarar contraseña para seguridad
      StoredPassword: CONFIG.PASSWORD_MASK,
      OptimisticLockField: usuario.OptimisticLockField
    }));

    return NextResponse.json(usuariosTransformados);

  } catch (error) {
    console.error('Error en GET /api/usuarios:', error);
    return NextResponse.json(
      { 
        error: true, 
        message: "Error interno del servidor al obtener usuarios",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Para crear usuarios
export async function POST(req: Request) {
  try {
    const data: UsuarioInput = await req.json();

    // Validaciones básicas
    const validation = validateUserInput(data, true);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Datos de entrada inválidos",
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.euser.findFirst({
      where: {
        OR: [
          { UserName: data.UserName },
          { HiddenUserName: data.HiddenUserName }
        ]
      }
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { 
          error: true, 
          message: "El nombre de usuario ya existe" 
        },
        { status: 409 } // Conflict
      );
    }

    // Hashear contraseña
    const passwordHash = generateHash(data.StoredPassword);

    // Crear usuario
    const usuario = await prisma.euser.create({
      data: {
        Oid: crypto.randomUUID().toUpperCase(),
        HiddenUserName: data.HiddenUserName.trim(),
        UserName: data.UserName.trim(),
        StoredPassword: passwordHash,
        IsActive: data.IsActive ?? true,
        ChangePasswordOnFirstLogon: false,
        OptimisticLockField: 0,
        GCRecord: null
      }
    });

    // Preparar respuesta (enmascarar contraseña)
    const usuarioCreado = {
      ...usuario,
      StoredPassword: CONFIG.PASSWORD_MASK
    };

    return NextResponse.json(usuarioCreado, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/usuarios:', error);
    return NextResponse.json(
      { 
        error: true, 
        message: "Error interno del servidor al crear usuario",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Para actualizar usuarios
export async function PUT(req: Request) {
  try {
    const data: UsuarioUpdateInput = await req.json();

    if (!data.Oid || !validateUUID(data.Oid)) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Se requiere un Oid válido del usuario" 
        },
        { status: 400 }
      );
    }

    // Validaciones de entrada
    const validation = validateUserInput(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Datos de entrada inválidos",
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.euser.findUnique({
      where: { Oid: data.Oid }
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Usuario no encontrado" 
        },
        { status: 404 }
      );
    }

    // Verificar duplicados (excluyendo el usuario actual)
    if (data.UserName || data.HiddenUserName) {
      const usuarioDuplicado = await prisma.euser.findFirst({
        where: {
          AND: [
            { Oid: { not: data.Oid } },
            {
              OR: [
                { UserName: data.UserName },
                { HiddenUserName: data.HiddenUserName }
              ].filter(Boolean)
            }
          ]
        }
      });

      if (usuarioDuplicado) {
        return NextResponse.json(
          { 
            error: true, 
            message: "El nombre de usuario ya está en uso" 
          },
          { status: 409 }
        );
      }
    }

    // Preparar datos de actualización
    const datosActualizacion: any = {
      ...(data.HiddenUserName && { HiddenUserName: data.HiddenUserName.trim() }),
      ...(data.UserName && { UserName: data.UserName.trim() }),
      ...(typeof data.IsActive === 'boolean' && { IsActive: data.IsActive })
    };

    // Si se proporciona una nueva contraseña, hashearla
    if (data.StoredPassword && data.StoredPassword !== CONFIG.PASSWORD_MASK) {
      datosActualizacion.StoredPassword = generateHash(data.StoredPassword);
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.euser.update({
      where: { Oid: data.Oid },
      data: datosActualizacion
    });

    // Preparar respuesta (enmascarar contraseña)
    const respuesta = {
      ...usuarioActualizado,
      StoredPassword: CONFIG.PASSWORD_MASK
    };

    return NextResponse.json(respuesta);

  } catch (error) {
    console.error('Error en PUT /api/usuarios:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Usuario no encontrado" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: true, 
        message: "Error interno del servidor al actualizar usuario",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Para eliminar usuarios
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const oid = searchParams.get('oid');

    if (!oid || !validateUUID(oid)) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Se requiere un Oid válido del usuario" 
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.euser.findUnique({
      where: { Oid: oid }
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Usuario no encontrado" 
        },
        { status: 404 }
      );
    }

    // Eliminar usuario
    await prisma.euser.delete({
      where: { Oid: oid }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Usuario eliminado correctamente" 
    });

  } catch (error) {
    console.error('Error en DELETE /api/usuarios:', error);
    
    // Manejar errores de restricciones de clave foránea
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { 
          error: true, 
          message: "No se puede eliminar el usuario porque tiene relaciones existentes" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: true, 
        message: "Error interno del servidor al eliminar usuario",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}