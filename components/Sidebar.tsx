"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Briefcase,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
    title: "Departamentos",
    icon: Briefcase,
    subItems: [
      { title: "Lista", path: "/dashboard/departamentos" },
      { title: "Asignaciones", path: "/dashboard/departamentos/asignaciones" },
    ],
  },
  {
    title: "Cargos",
    icon: Briefcase,
    subItems: [
      { title: "Perfiles", path: "/dashboard/cargos/perfiles" },
      { title: "Vacantes", path: "/dashboard/cargos/vacantes" },
    ],
  },
  {
    title: "Turnos",
    icon: Clock,
    subItems: [
      { title: "Gestión", path: "/dashboard/turnos" },
      { title: "Calendario", path: "/dashboard/turnos/calendario" },
    ],
  },
  {
    title: "Horarios",
    icon: Calendar,
    subItems: [
      { title: "Registros", path: "/dashboard/horarios" },
      { title: "Plantillas", path: "/dashboard/horarios/plantillas" },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (title) => setOpenItem(openItem === title ? null : title);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-red-900 border-r border-red-700 shadow-xl z-40 flex flex-col transition-all duration-300
        ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* Encabezado: logo con fondo blanco para contraste */}
      <div className={`flex items-center justify-between p-4 border-b border-red-700 ${collapsed ? "px-3" : "px-6"}`}>
        <div className="flex items-center gap-3">
          {/* Contenedor blanco para el logo */}
          <div className="bg-white p-1 rounded-lg shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={collapsed ? 32 : 48} 
              height={collapsed ? 32 : 48} 
              className="rounded"
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-white">Oclock</h1>
              <p className="text-xs text-red-200">Panel de Administración</p>
            </div>
          )}
        </div>

        {/* Botón colapsar / expandir */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-red-800 transition text-white"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto mt-3 px-2">
        {menuItems.map((item) => {
          const isOpen = openItem === item.title;
          const Icon = item.icon;
          return (
            <div key={item.title} className="mb-1">
              <button
                onClick={() => toggleItem(item.title)}
                className={`flex items-center justify-between w-full rounded-md px-3 py-3 hover:bg-red-800 transition text-white
                  ${isOpen ? "bg-red-800 text-white" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={collapsed ? 20 : 22} className="text-red-200" />
                  {!collapsed && <span className="font-medium text-white">{item.title}</span>}
                </div>

                {/* flecha solo si no está colapsado */}
                {!collapsed && item.subItems && (
                  <div className="text-red-200">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                )}
              </button>

              {/* Submenú sólo cuando NO está colapsado */}
              {!collapsed && isOpen && item.subItems && (
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

      {/* Footer del sidebar (opcional) */}
      {!collapsed && (
        <div className="p-4 border-t border-red-700">
          <div className="text-center">
            <p className="text-xs text-red-300">Versión 1.0</p>
            <p className="text-xs text-red-400 mt-1">© 2024 Oclock</p>
            <p className="text-xs text-red-400 mt-1">INR</p>
          </div>
        </div>
      )}
    </aside>
  );
}



