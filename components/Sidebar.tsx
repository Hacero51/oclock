"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Building2,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  CalendarSync,
  CalendarCheck2,
  Folders,
  ShieldUser,
  LogOut,
  Home,
  Users,
  NotebookTabs,
  FolderTree,
  Calendar,
  FileText,
  Settings
} from "lucide-react";

const menuItems = [
  {
    title: "Empresa",
    icon: Building2,
    subItems: [
      { title: "Empleados", path: "/dashboard/empresa/empleados", icon: Users },
      { title: "Departamentos", path: "/dashboard/empresa/departamentos", icon: FolderTree },
      { title: "Centros de Costos", path: "/dashboard/empresa/centrocostos", icon: NotebookTabs },
    ],
  },
  {
    title: "Turnos",
    icon: CalendarSync,
    subItems: [
      { title: "Turnos", path: "/dashboard/turnos/turnos", icon: Calendar },
      { title: "Horarios", path: "/dashboard/turnos/horarios", icon: Clock },
    ],
  },
  {
    title: "Asistencia",
    icon: CalendarCheck2,
    subItems: [
      { title: "Registros", path: "/dashboard/asistencia/registros", icon: FileText },
      { title: "Marcaciones", path: "/dashboard/asistencia/marcaciones", icon: Fingerprint },
      { title: "Permisos e Incapacidades", path: "/dashboard/asistencia/permisoseincapacidades", icon: FileText },
    ],
  },
  {
    title: "Dispositivos",
    icon: Fingerprint,
    path: "/dashboard/dispositivos",
  },
  {
    title: "Reportes",
    icon: FileText,
    subItems: [{ title: "Informes", path: "/dashboard/reportes/informes", icon: FileText }],
  },
  {
    title: "Maestros",
    icon: Folders,
    subItems: [
      { title: "Asistencia", path: "/dashboard/maestros/asistencia", icon: CalendarCheck2 },
      { title: "Días Festivos", path: "/dashboard/maestros/diasfestivos", icon: Calendar },
    ],
  },
  {
    title: "Administración",
    icon: ShieldUser,
    subItems: [
      { title: "Configuración", path: "/dashboard/administracion/configuracion", icon: Settings },
      { title: "Usuario", path: "/dashboard/administracion/usuario", icon: Users },
      { title: "Logs de Auditoría", path: "/dashboard/administracion/logs", icon: FileText },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [hoverExpand, setHoverExpand] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  // Detectar móvil para deshabilitar hover
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Si es móvil, expandido depende SOLO de collapsed (no hover)
  const isExpanded = isMobile ? !collapsed : (!collapsed || hoverExpand);

  const toggleItem = (title: string) => setOpenItem(openItem === title ? null : title);

  return (
    <>
      {/* Backdrop Móvil */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        onMouseEnter={() => !isMobile && collapsed && setHoverExpand(true)}
        onMouseLeave={() => !isMobile && collapsed && setHoverExpand(false)}
        onClick={() => {
          if (collapsed) setCollapsed(false);
        }}
        className={`fixed left-0 top-0 h-screen bg-red-900 border-r border-red-800 shadow-2xl z-50 flex flex-col transition-all duration-300
        ${isExpanded ? "w-72" : "w-20"}`}
      >
        {/* Encabezado */}
        <div className={`flex items-center justify-between p-4 border-b border-red-800 ${isExpanded ? "px-5" : "px-3"}`}>
          {/* Logo y nombre */}
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer group">
            <div className={`p-1 bg-white/10 rounded-xl shadow-lg group-hover:bg-white/20 transition-all border border-white/5`}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={isExpanded ? 75 : 75}
                height={isExpanded ? 75 : 75}
                className="rounded-lg shadow-inner object-contain"
                priority
              />
            </div>

            {isExpanded && (
              <div className="flex flex-col text-left">
                <h1 className="text-xl font-black text-white tracking-tight leading-tight">En Punto</h1>
                <h3 className="text-xs text-red-100 font-bold opacity-90">Sistema de Gestión</h3>
              </div>
            )}
          </Link>

          {/* Botón colapsar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-red-800 transition-all text-white hover:scale-105"
          >
            {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Menú */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Dashboard Home */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 w-full rounded-xl px-3 py-3 hover:bg-red-800 transition-all text-white group mb-2"
          >
            <Home size={20} className="text-red-100 group-hover:text-white transition-colors" />
            {isExpanded && <span className="font-medium">Dashboard</span>}
          </Link>

          {menuItems.map((item) => {
            const isOpen = openItem === item.title;
            const Icon = item.icon;

            return (
              <div key={item.title} className="mb-1">
                {item.path ? (
                  <Link
                    href={item.path}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-3 hover:bg-red-800 transition-all text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-red-100 group-hover:text-white transition-colors" />
                      {isExpanded && <span className="font-medium">{item.title}</span>}
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleItem(item.title)}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-3 hover:bg-red-800 transition-all text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-red-100 group-hover:text-white transition-colors" />
                      {isExpanded && <span className="font-medium">{item.title}</span>}
                    </div>
                    {isExpanded && item.subItems && (
                      <div className="text-red-100 group-hover:text-white transition-colors transform transition-transform">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    )}
                  </button>
                )}

                {isExpanded && isOpen && item.subItems && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-red-800 pl-4">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.title}
                          href={sub.path}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-100 hover:bg-red-800 hover:text-white transition-all group"
                        >
                          <SubIcon size={16} className="text-red-200 group-hover:text-white transition-colors" />
                          <span>{sub.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Botón salir */}
        <div className="p-4 border-t border-red-800">


          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`w-full flex items-center gap-3 text-left px-3 py-3 rounded-xl hover:bg-red-800 text-red-100 hover:text-white transition-all group ${!isExpanded ? "justify-center" : ""
              }`}
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            {isExpanded && <span className="font-medium">Cerrar Sesión</span>}
          </button>

          {/* Footer */}
          {isExpanded && (
            <div className="mt-4 text-center space-y-2 ">
              <div className="p-3 rounded-lg">
                <p className="text-xs text-white/80 font-medium">Versión 1.0</p>
                <p className="text-xs text-white/80 mt-1">© 2025 INR En Punto</p>
                <p className="text-xs text-white/60 mt-1">Todos los derechos reservados</p>
              </div>
            </div>
          )}
        </div>
      </aside >
    </>
  );
}
