# En Punto (oclock) 🕒

[![Next.js](https://img.shields.io/badge/Next.js-16.0.9-blue.svg?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2D3748.svg?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.0.0.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)

**En Punto** (oclock) es una solución integral y de alto rendimiento para el **control de asistencia y gestión de dispositivos biométricos ZKTeco**. Diseñado como una aplicación web moderna y segura con **Next.js**, incorpora servicios en segundo plano para la sincronización robusta de terminales, gestión completa de personal, turnos de trabajo, permisos, reportes de nómina y auditoría en tiempo real.

---

## 🌟 Características Principales

### 🔌 Integración Biométrica de Doble Capa
El sistema permite comunicarse con terminales biométricas ZKTeco mediante dos metodologías complementarias:
1. **Servidor ADMS Nativo**: El backend de Next.js expone endpoints compatibles con el protocolo ADMS de ZKTeco (`/iclock/cdata`, `/iclock/getrequest`, `/iclock/devicecmd`), permitiendo que los dispositivos empujen registros directamente al servidor HTTP.
2. **Servicio Companion FastAPI (Python)**: Un servicio en Python que utiliza la librería `pyzk` para conectarse activamente mediante sockets de red a las terminales y realizar lecturas directas (polling) de usuarios e historial de marcaciones de forma segura.

### 📅 Control de Horarios y Turnos
- Configuración de turnos flexibles y ordinarios.
- Soporte para horarios rotativos, días festivos y jornadas cruzadas (transnoche).
- Asignación de calendarios específicos por empleado o a nivel de departamento.

### 👥 Gestión de Talento Humano (Empresa)
- Panel administrativo para gestionar empleados, departamentos y centros de costos.
- Control de perfiles con roles y permisos dinámicos integrados en la barra lateral.
- Registro detallado de ausencias, vacaciones, incapacidades y permisos remunerados/no remunerados.

### 📊 Análisis y Reportes
- Cálculos automáticos de horas laboradas según la legislación vigente (e.g., límites de horas ordinarias, recargos nocturnos, extras diurnas/nocturnas, dominicales y festivos).
- Exportación de informes compatibles con software de nómina.
- Monitoreo en tiempo real del estado de los dispositivos y logs de auditoría global.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://react.dev/), [Next.js 16 (App Router)](https://nextjs.org/) con TypeScript y [Tailwind CSS 4](https://tailwindcss.com/).
- **Componentes de UI**: Primitivas de [Radix UI](https://www.radix-ui.com/) y set de íconos [Lucide React](https://lucide.dev/).
- **Backend / API**: Route Handlers de Next.js, [tRPC](https://trpc.io/) para comunicación fuertemente tipada de extremo a extremo, y [NextAuth.js 4](https://next-auth.js.org/) para control de accesos.
- **ORM / Base de Datos**: [Prisma ORM 6](https://www.prisma.io/) mapeado a base de datos relacional **MySQL**.
- **Servicio Companion**: [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn que envuelve la biblioteca `pyzk`.
- **Ejecución de Tareas**: Servicio de background automático (`ScheduledSyncService`) integrado en Next.js (`instrumentation.ts`) para sincronización cíclica de relojes.

---

## ⚙️ Estructura del Proyecto

```bash
oclock/
├── app/                  # Rutas de Next.js (Dashboard, APIs, e endpoints ADMS en /iclock)
├── components/           # Componentes de React reutilizables (Sidebar, UI, Form, etc.)
├── prisma/               # Schema y migraciones de la base de datos MySQL
├── python_service/       # Código del servicio FastAPI para conexión directa con biométricos
├── lib/                  # Utilidades compartidas (Prisma client, validaciones, sidebar config)
├── scripts/              # Scripts de mantenimiento y utilidades del sistema
├── server/               # Lógica del servidor, controladores biométricos y motor de sincronización
├── .env                  # Variables de entorno
├── package.json          # Dependencias y scripts de Node.js
└── tsconfig.json         # Configuración de TypeScript
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Node.js** v20 o superior y npm.
- **Python 3.10** o superior.
- Servidor **MySQL** activo.

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Hacero51/oclock.git
cd oclock
```

### Paso 2: Configurar las Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente plantilla:

```env
# Configuración del Entorno ('production' o 'development')
APP_ENV="development"

# URL de Conexión de Prisma a la Base de Datos MySQL
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_bd?connection_limit=50&pool_timeout=30"

# Secreto para NextAuth.js
NEXTAUTH_SECRET="un_secreto_seguro_aqui"

# Límite de Horas Ordinarias Semanales (Regulación laboral)
WEEKLY_ORDINARY_LIMIT=44
```

> [!IMPORTANT]
> **Bloqueo de Seguridad**: El sistema cuenta con un validador (`lib/env.ts`) ejecutado en el inicio del servidor (`instrumentation.ts`). Si intentas conectarte a una dirección IP de base de datos considerada productiva y `APP_ENV` no está explícitamente en `"production"`, el servidor arrojará un error de seguridad para evitar la alteración accidental de datos.

### Paso 3: Instalar Dependencias de Node.js
Instala los paquetes necesarios de la aplicación web:
```bash
npm install
```
*Este comando generará automáticamente los clientes de Prisma al finalizar gracias al script de `postinstall`.*

### Paso 4: Configurar el Servicio de Python
Se recomienda crear un entorno virtual para aislar las dependencias:
```bash
# Crear entorno virtual
python -m venv .venv

# Activar en Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Activar en Linux/macOS
source .venv/bin/activate

# Instalar dependencias
pip install -r python_service/requirements.txt
```

### Paso 5: Inicializar la Base de Datos
Genera el esquema en tu base de datos MySQL usando Prisma:
```bash
npx prisma db push
```

---

## 🏃 Ejecución del Proyecto

### Desarrollo
Para iniciar de manera simultánea el servidor de Next.js (en el puerto `3001`) y el servicio FastAPI de Python (en el puerto `8005`), ejecuta:
```bash
npm run dev
```
La aplicación web estará disponible en: `http://localhost:3001`
El servicio API biométrico en Python estará en: `http://localhost:8005`

### Producción
1. Construye el bundle de producción de Next.js:
   ```bash
   npm run build
   ```
2. Inicia los servidores en modo producción:
   ```bash
   npm run start
   ```

---

## 📖 Reglas de Negocio y Leyes Laborales
El cálculo de horas de la aplicación tiene parametrizaciones adaptadas para acomodarse a las normativas laborales (por ejemplo, la transición en Colombia de 44 horas semanales hacia las 42 horas). Puedes ajustar este comportamiento en tu archivo `.env` modificando `WEEKLY_ORDINARY_LIMIT`.

---

## 🔒 Licencia
Este proyecto es privado. Todos los derechos reservados.

