"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  LogOut
} from "lucide-react";

const menuItems = [
  {
    title: "Empresa",
    icon: Building2,
    subItems: [
      { title: "Empleados", path: "/dashboard/empresa/empleados" },
      { title: "Sucursales", path: "/dashboard/empresa/sucursales" },
      { title: "Departamentos", path: "/dashboard/empresa/departamentos" },
      { title: "Centros de Costos", path: "/dashboard/empresa/centrocostos" },
    ],
  },
  {
    title: "Turnos",
    icon: CalendarSync,
    subItems: [
      { title: "Turnos", path: "/dashboard/turnos/turnos" },
      { title: "Horarios", path: "/dashboard/turnos/horarios" },
    ],
  },
  {
    title: "Asistenia",
    icon: CalendarCheck2,
    subItems: [
      { title: "Registros", path: "/dashboard/asistencia/registros" },
      { title: "Marcaciones", path: "/dashboard/asistencia/marcaciones" },
      { title: "Permisos e Incapacidades", path: "/dashboard/asistencia/permisoseincapacidades" },
    ],
  },
  {
    title: "Dispositivos",
    icon: Fingerprint,
    path: "/dashboard/dispositivos",
  },
  {
    title: "Reportes",
    icon: Clock,
    subItems: [{ title: "Informes", path: "/dashboard/reportes/informes" }],
  },
  {
    title: "Maestros",
    icon: Folders,
    subItems: [
      { title: "Asistencia", path: "/dashboard/maestros/asistencia" },
      { title: "Dias Festivos", path: "/dashboard/maestros/diasfestivos" },
    ],
  },
  {
    title: "Administracion",
    icon: ShieldUser,
    subItems: [
      { title: "Configuracion", path: "/dashboard/administracion/configuracion" },
      { title: "Usuario", path: "/dashboard/administracion/usuario" },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const [openItem, setOpenItem] = useState(null);
  const [hoverExpand, setHoverExpand] = useState(false);

  const isExpanded = !collapsed || hoverExpand;

  const toggleItem = (title) => setOpenItem(openItem === title ? null : title);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <aside
      onMouseEnter={() => collapsed && setHoverExpand(true)}
      onMouseLeave={() => collapsed && setHoverExpand(false)}
      className={`fixed left-0 top-0 h-screen bg-red-900 border-r border-red-700 shadow-xl z-40 flex flex-col transition-all duration-300
        ${isExpanded ? "w-72" : "w-20"}`}
    >
      {/* Encabezado */}
      <div className={`flex items-center justify-between p-10 border-b border-red-700 ${isExpanded ? "px-6" : "px-3"}`}>

        {/* Logo click → dashboard */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="p-1 rounded-lg shadow-sm">
            <Image
              src="/logo.png"
              alt="Logo"
              width={isExpanded ? 90 : 80}
              height={isExpanded ? 90 : 80}
              className="rounded"
            />
          </div>

          {isExpanded && (
            <div>
              <h1 className="text-lg font-semibold text-white">En Punto</h1>
              <h3 className="text-xs text-red-200">Panel de Administración</h3>
            </div>
          )}
        </Link>

        {/* Botón colapsar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-red-800 transition text-white"
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto mt-3 px-2">
        {menuItems.map((item) => {
          const isOpen = openItem === item.title;
          const Icon = item.icon;

          return (
            <div key={item.title} className="mb-1">
              {item.path ? (
                <Link
                  href={item.path}
                  className="flex items-center justify-between w-full rounded-md px-3 py-3 hover:bg-red-800 transition text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={isExpanded ? 22 : 20} className="text-red-200" />
                    {isExpanded && <span className="font-medium">{item.title}</span>}
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => toggleItem(item.title)}
                  className="flex items-center justify-between w-full rounded-md px-3 py-3 hover:bg-red-800 transition text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={isExpanded ? 22 : 20} className="text-red-200" />
                    {isExpanded && <span className="font-medium">{item.title}</span>}
                  </div>
                  {isExpanded && item.subItems && (
                    <div className="text-red-200">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  )}
                </button>
              )}

              {isExpanded && isOpen && item.subItems && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-red-600 pl-3">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.title}
                      href={sub.path}
                      className="block px-3 py-2 rounded text-sm text-red-200 hover:bg-red-800 hover:text-white transition"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Botón salir */}
      <button
        onClick={handleLogout}
        className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-md hover:bg-red-800 text-red-200 transition ${
          !isExpanded ? "justify-center" : ""
        }`}
      >
        <LogOut size={isExpanded ? 18 : 20} />
        {isExpanded && <span>Salir</span>}
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-red-700 space-y-3">
        {isExpanded && (
          <div className="text-center">
            <p className="text-xs text-red-300">Versión 1.0</p>
            <p className="text-xs text-red-400 mt-1">© 2025 En Punto</p>
            <p className="text-xs text-red-400 mt-1">INR</p>
          </div>
        )}
      </div>
    </aside>
  );
}

