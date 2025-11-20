"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";

export default function SucursalesPage() {
  const columnas = ["Código", "Nombre a mostrar", "Tercero", "Correo"];

  type Sucursal = {
    [key: string]: any;
    "Código": string;
    "Nombre a mostrar": string;
    "Tercero": string;
    "Correo": string;
  };

   // Modal Update
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [datos, setDatos] = useState<Sucursal[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchSucursales() {
      try {
        const res = await fetch("/api/sucursales");
        if (!res.ok) throw new Error("Error al obtener sucursales");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchSucursales();
  }, [isMounted]);

    // Al hacer click en fila
  const handleRowClick = (sucursales: Sucursal) => {
    setSelectedSucursal(sucursales);
    setOpenUpdate(true);
  };

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando sucursales...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sucursales</h1>
      </div>

      {/* 🔹 Tabla */}
      <Tabla columnas={columnas} datos={datos}  onRowClick={handleRowClick} />

            {/* Update Modal */}
            {openUpdate && selectedSucursal && (
              <UpdateModal
                type="sucursal"
                data={selectedSucursal}
                onClose={() => setOpenUpdate(false)}
              />
            )}
    </div>
  );
}
