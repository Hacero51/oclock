"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";

export default function CentroCostosPage() {
  const columnas = ["Codigo", "Nombre"];

  type CentroCosto = {
    "Codigo": string;
    "Nombre": string;
  };
  const [selectedCentroCostos, setSelectedCentroCostos] = useState<CentroCosto | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [datos, setDatos] = useState<CentroCosto[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchCentros() {
      try {
        const res = await fetch("/api/centrocostos");
        if (!res.ok) throw new Error("Error al obtener centros de costos");

        const data = await res.json();
        setDatos(data);

      } catch (err) {
        console.error("Error:", err);
      }
    }

    fetchCentros();
  }, [isMounted]);

    const handleRowClick = (centrocostos: CentroCosto) => {
    setSelectedCentroCostos(centrocostos);
    setOpenUpdate(true);
  };


  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Centros de Costos</h1>
      </div>

      <Tabla columnas={columnas} datos={datos} onRowClick={handleRowClick} />

              {/* Update Modal */}
              {openUpdate && selectedCentroCostos && (
                <UpdateModal
                  type="centrocosto"
                  data={selectedCentroCostos}
                  onClose={() => setOpenUpdate(false)}
                />
              )}
    </div>
  );
}

