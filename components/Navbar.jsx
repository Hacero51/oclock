"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useContext } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Plus,
  ChevronDown,
  Users,
  Briefcase,
  FolderTree,
  Calendar,
  Fingerprint,
  Clock,
  BookmarkCheck,
  FileText,
  MapPin,
  CalendarSync,
} from "lucide-react";

import { DashboardContext } from "@/app/dashboard/layout";

export default function Navbar({ onOpenCreate }) {
  const { estadoEmpleados, setEstadoEmpleados } = useContext(DashboardContext);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const opciones = [
    { label: "Empleado", icon: Users, type: "Empleado" },
    { label: "Cargo", icon: Briefcase, type: "Cargo" },
    { label: "Centro de Costo", icon: FolderTree, type: "Centro Costo" },
    { label: "Día Festivo", icon: Calendar, type: "Dia Festivo" },
    { label: "Dispositivo", icon: Fingerprint, type: "Dispositivo" },
    { label: "Horarios", icon: Clock, type: "Horarios" },
    { label: "Marcación", icon: BookmarkCheck, type: "Marcacion" },
    { label: "Permisos e Incapacidades", icon: FileText, type: "Permisos E Incapacidades" },
    { label: "Sucursal", icon: MapPin, type: "Sucursal" },
    { label: "Turno", icon: CalendarSync, type: "Turno" },
  ];

  const handleOpcionClick = (type) => {
    setMenuAbierto(false);
    if (onOpenCreate) onOpenCreate(type);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-4 justify-between bg-gradient-to-r from-blue-800 to-blue-700 border-b border-blue-600/50 px-6 py-3 shadow-lg">

      {/* Botón Crear */}
      <div className="relative">
        <Button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="bg-white text-blue-700 border border-blue-300 shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Crear Nuevo
          <ChevronDown className={`h-4 w-4 ml-2 ${menuAbierto ? "rotate-180" : ""}`} />
        </Button>

        {menuAbierto && (
          <div className="absolute left-0 mt-2 w-64 bg-white border rounded-xl shadow-xl z-50">
            {opciones.map((op) => {
              const Icon = op.icon;
              return (
                <button
                  key={op.type}
                  onClick={() => handleOpcionClick(op.type)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50"
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{op.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Select Estado (usa contexto) */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">Filtrar por:</span>

        <Select value={estadoEmpleados} onValueChange={(v) => setEstadoEmpleados(v)}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {menuAbierto && <div className="fixed inset-0 bg-black/10 z-40" onClick={() => setMenuAbierto(false)} />}
    </div>
  );
}