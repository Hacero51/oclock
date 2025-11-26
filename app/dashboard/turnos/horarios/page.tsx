"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { Button } from "@/components/ui/Button";
import { Clock, Plus, Download } from "lucide-react";

export default function HorariosPage() {
  const columnas = ["Nombre a mostrar", "Tiempo total", "Tipo"];

  type Horarios = {
    [key: string]: any;
    "Nombre a mostrar": string;
    "Tiempo total": string;
    "Tipo": string;
  };

  const [selectedHorarios, setSelectedHorarios] = useState<Horarios | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [datos, setDatos] = useState<Horarios[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchHorarios() {
      try {
        const res = await fetch("/api/horarios");
        if (!res.ok) throw new Error("Error al obtener horarios");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchHorarios();
  }, [isMounted]);

  const handleRowClick = (horarios: Horarios) => {
    setSelectedHorarios(horarios);
    setOpenUpdate(true);
  };

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando horarios...</p>
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
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
            <p className="text-sm text-gray-600 mt-1">
              {datos.length} horarios configurados
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabla columnas={columnas} datos={datos} onRowClick={handleRowClick} />
      </div>

      {/* Update Modal */}
      {openUpdate && selectedHorarios && (
        <UpdateModal
          type="horariofijo"
          data={selectedHorarios}
          onClose={() => setOpenUpdate(false)}
        />
      )}
    </div>
  );
}