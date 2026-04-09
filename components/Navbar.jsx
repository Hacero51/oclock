"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useContext } from "react";
import { useSession } from "next-auth/react";
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
  RefreshCw,
} from "lucide-react";

import { DashboardContext } from "@/app/dashboard/layout";

export default function Navbar({ onOpenCreate }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { estadoEmpleados, setEstadoEmpleados, triggerRefresh } = useContext(DashboardContext);
  const { data: session } = useSession();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleRefresh = () => {
    if (triggerRefresh) triggerRefresh();
    startTransition(() => {
      router.refresh();
    });
  };

  const opciones = [
    { label: "Empleado", icon: Users, type: "Empleado" },
    { label: "Cargo", icon: Briefcase, type: "Cargo" },
    { label: "Centro de Costo", icon: FolderTree, type: "Centro Costo" },
    { label: "Día Festivo", icon: Calendar, type: "Dia Festivo" },
    { label: "Dispositivo", icon: Fingerprint, type: "Dispositivo" },
    { label: "Horarios", icon: Clock, type: "Horarios" },
    { label: "Marcación", icon: BookmarkCheck, type: "Marcacion" },
    { label: "Permisos e Incapacidades", icon: FileText, type: "Permisos E Incapacidades" },
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
          className="bg-white text-blue-700 border border-blue-300 shadow-md px-2.5 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Crear Nuevo</span>
          <ChevronDown className={`h-4 w-4 ml-1.5 sm:ml-2 ${menuAbierto ? "rotate-180" : ""}`} />
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

      {/* Grupo Derecha: Filtro + Usuario */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Botón de Recargar */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isPending}
          title="Recargar información"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-9 w-9 p-0 flex items-center justify-center transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>

        {/* Select Estado (usa contexto) */}
        <div className="flex items-center gap-2">
          <span className="text-white text-sm hidden md:inline">Filtrar por:</span>

          <Select value={estadoEmpleados} onValueChange={(v) => setEstadoEmpleados(v)}>
            <SelectTrigger className="w-[120px] sm:w-[140px] bg-white h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Perfil de Usuario */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/20">
          <div className="flex flex-col items-end hidden lg:flex">
            <span className="text-sm font-bold text-white tracking-wide leading-tight">
              {session?.user?.username || 'Usuario'}
            </span>
            <span className="text-[10px] text-blue-100/60 font-bold uppercase tracking-wider">
              Administrador
            </span>
          </div>

          <div className="relative group">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold shadow-lg group-hover:bg-white/20 transition-all cursor-pointer ring-2 ring-transparent group-hover:ring-white/30">
              {session?.user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Tooltip para móvil/tablet */}
            <div className="absolute top-full right-0 mt-3 px-3 py-2 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] min-w-[150px] lg:hidden">
              <p className="text-sm font-bold text-gray-800">{session?.user?.username || 'Usuario'}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase">Administrador</p>
            </div>
          </div>
        </div>
      </div>

      {menuAbierto && <div className="fixed inset-0 bg-black/10 z-40" onClick={() => setMenuAbierto(false)} />}
    </div>
  );
}