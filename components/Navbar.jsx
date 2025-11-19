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
    <div className="relative flex flex-wrap items-center gap-3 justify-between 
        bg-blue-900 border-b border-blue-300 px-4 py-2">

      {/* Botón + */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-white-900"
        >
          <ClockPlus className="h-5 w-5" />
        </Button>

        {/* Menú desplegable */}
        {menuAbierto && (
          <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow z-50">
            {opciones.map((op) => (
              <button
                key={op.type}
                onClick={() => handleOpcionClick(op.type)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                {op.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Select Estado */}
      <Select value={estado} onValueChange={setEstado}>
        <SelectTrigger className="w-[160px] text-sm bg-white">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="activos">Activos</SelectItem>
          <SelectItem value="inactivos">Inactivos</SelectItem>
          <SelectItem value="todos">Todos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

