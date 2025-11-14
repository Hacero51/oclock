"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ClockPlus,
  UserPlus,
  Briefcase,
  Layers,
  Clock,
  Calendar,
  Fingerprint,
  BookmarkCheck,
  BellElectric,
  GitBranch,
  CalendarSync,
  FilePlusCorner,
} from "lucide-react";



/**
 * NavbarSecundario — Versión con apertura de modal
 * @param {function} onOpenCreate - Callback desde DashboardLayout para abrir un formulario dinámico
 */
export default function NavbarSecundario({ onOpenCreate }) {
  const [estado, setEstado] = useState("activos");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Mapa de formularios
  const opciones = [
    { label: "Empleado", icon: UserPlus, type: "empleado" }, 
    { label: "Cargo", icon: Briefcase, type: "cargo" },
    { label: "Centro de Costo", icon: Layers, type: "centrocosto" },
    { label: "Día Festivo", icon: Calendar, type: "diafestivo" },
    { label: "Dispositivo", icon: Fingerprint, type: "dispositivo" },
    { label: "Horario Fijo", icon: Clock, type: "horariofijo" },
    { label: "Marcación", icon: BookmarkCheck, type: "marcacion" },
    { label: "Permisos e Incapacidades", icon: BellElectric, type: "permisoseinca" },
    { label: "Sucursal", icon: GitBranch, type: "sucursal" },
    { label: "Turno", icon: CalendarSync, type: "turno" },
  ];

  const handleOpcionClick = (type) => {
    setMenuAbierto(false);
    if (onOpenCreate) onOpenCreate(type);
  };

  return (
    <div className="relative flex items-center justify-between bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 px-4 py-1 shadow-sm">
      <div className="flex items-center space-x-2">
        {/* Botón + con menú desplegable */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            title="Nuevo registro"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <ClockPlus className="h-4 w-4 text-blue-600" />
          </Button>

          {menuAbierto && (
            <div className="absolute left-0 mt-1 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <ul className="max-h-[300px] overflow-y-auto">
                {opciones.map(({ label, icon: Icon, type }) => (
                  <li key={type}>
                    <button
                      onClick={() => handleOpcionClick(type)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Filtro por estado */}
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[150px] text-sm bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buscador y botón mensaje */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Buscar..."
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}

