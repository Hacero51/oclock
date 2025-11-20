"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";

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

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando Turnos...
      </div>
    );
  }

      const handleRowClick = (turnos: Turnos) => {
    setSelectedTurnos(turnos);
    setOpenUpdate(true);
  };


  return (
    <div className="space-y-6 p-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Turnos</h1>
      </div>

      {/* 🔹 Tabla */}
      <Tabla columnas={columnas} datos={datos} onRowClick={handleRowClick} />

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