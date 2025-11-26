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
  ChevronDown,
  Plus,
  Users,
  MapPin,
  FolderTree,
  FileText,
  Settings,
} from "lucide-react";

/**
 * NavbarSecundario — Versión mejorada con diseño rojo institucional
 */
export default function NavbarSecundario({ onOpenCreate }) {
  const [estado, setEstado] = useState("activos");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Mapa de formularios con iconos mejorados
  const opciones = [
    { label: "Empleado", icon: Users, type: "empleado" },
    { label: "Cargo", icon: Briefcase, type: "cargo" },
    { label: "Centro de Costo", icon: FolderTree, type: "centrocosto" },
    { label: "Día Festivo", icon: Calendar, type: "diafestivo" },
    { label: "Dispositivo", icon: Fingerprint, type: "dispositivo" },
    { label: "Horario Fijo", icon: Clock, type: "horariofijo" },
    { label: "Marcación", icon: BookmarkCheck, type: "marcacion" },
    { label: "Permisos e Incapacidades", icon: FileText, type: "permisoseinca" },
    { label: "Sucursal", icon: MapPin, type: "sucursal" },
    { label: "Turno", icon: CalendarSync, type: "turno" },
  ];

  const handleOpcionClick = (type) => {
    setMenuAbierto(false);
    if (onOpenCreate) onOpenCreate(type);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-4 justify-between 
        bg-gradient-to-r from-blue-800 to-blue-700 border-b border-blue-600/50 px-6 py-3 shadow-lg">

      {/* Botón Crear + */}
      <div className="relative">
        <Button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 border border-blue-300 shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Nuevo</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${menuAbierto ? "rotate-180" : ""}`} />
        </Button>

        {/* Menú desplegable mejorado */}
        {menuAbierto && (
          <div className="absolute left-0 mt-2 w-64 bg-white border border-green-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-green-700 to-green-600">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {opciones.map((op) => {
                const Icon = op.icon;
                return (
                  <button
                    key={op.type}
                    onClick={() => handleOpcionClick(op.type)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 border-b border-gray-100 last:border-b-0 transition-all duration-150 group"
                  >
                    <Icon className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                    <span className="font-medium">{op.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Selecciona una opción
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Select Estado mejorado */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-medium whitespace-nowrap">
          Filtrar por:
        </span>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[140px] text-sm bg-white/90 border-blue-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:bg-white transition-all">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-white border-red-200">
            <SelectItem value="activos" className="focus:bg-red-50 focus:text-red-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Activos
              </div>
            </SelectItem>
            <SelectItem value="inactivos" className="focus:bg-red-50 focus:text-red-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Inactivos
              </div>
            </SelectItem>
            <SelectItem value="todos" className="focus:bg-red-50 focus:text-red-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Todos
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Efecto de overlay cuando el menú está abierto */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-black/10 z-40"
          onClick={() => setMenuAbierto(false)}
        />
      )}
    </div>
  );
}
