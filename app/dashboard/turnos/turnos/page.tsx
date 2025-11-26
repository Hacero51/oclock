"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { CalendarSync } from "lucide-react";

export default function TurnosPage() {
  const columnas = ["Nombre", "Estado"];

  type Turnos = {
    [key: string]: any;
    "Nombre": string;
    "Estado": string;
  };

  const [selectedTurnos, setSelectedTurnos] = useState<Turnos | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
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
  }, [isMounted]);

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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <CalendarSync className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
            <p className="text-sm text-gray-600 mt-1">
              {datos.length} turnos configurados
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabla columnas={columnas} datos={datos} onRowClick={handleRowClick} />
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