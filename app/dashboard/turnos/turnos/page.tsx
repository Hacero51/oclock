"use client";

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import Tabla from "../../../../components/Table";
import CreateModal from "@/components/CreateModal";
import UpdateModal from "@/components/UpdateModal";
import { CalendarSync, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TurnosPage() {
  const { refreshTrigger } = useContext(DashboardContext);
  const columnas = ["Nombre", "Estado"];

  type Turnos = {
    [key: string]: any;
    "Nombre": string;
    "Estado": string;
  };

  const [selectedTurnos, setSelectedTurnos] = useState<Turnos | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [datos, setDatos] = useState<Turnos[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchTurnos() {
      try {
        const res = await fetch("/api/turnos");
        if (!res.ok) throw new Error("Error al obtener turnos");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchTurnos();
  }, [isMounted, refreshTrigger]);

  const handleRowClick = (turnos: Turnos) => {
    setSelectedTurnos(turnos);
    setOpenUpdate(true);
  };

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <CalendarSync className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-grey-700/50 font-sans">
      <div className="max-w mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl shadow-lg p-6 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Turnos</h1>
              <p className="text-blue-100 text-lg font-medium opacity-90 max-w-xl">
                Gestión de Organizacional de turnos.
              </p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <Tabla columnas={columnas} datos={datos} onRowClick={handleRowClick} />
        </div>
      </div>
      {/* Update Modal */}
      {openUpdate && selectedTurnos && (
        <UpdateModal
          type="turno"
          data={selectedTurnos}
          onClose={() => setOpenUpdate(false)}
        />
      )}
    </div>
  );
}