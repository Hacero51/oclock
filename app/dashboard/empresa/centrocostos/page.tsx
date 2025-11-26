"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { AlignCenterVertical} from "lucide-react";

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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <AlignCenterVertical className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centros de Costos</h1>
            <p className="text-sm text-gray-600 mt-1">
              {datos.length} centros de costo registrados
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabla columnas={columnas} datos={datos} onRowClick={handleRowClick} />
      </div>

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

