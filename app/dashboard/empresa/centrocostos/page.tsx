"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";

export default function SucursalesPage() {
  const columnas = ["Código", "Nombre"];

  type Sucursal = {
    [key: string]: any;
    "Código": string;
    "Nombre": string;
  };

  const [datos, setDatos] = useState<Sucursal[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchCentrosCostos() {
      try {
        const res = await fetch("/api/centrocostos");
        if (!res.ok) throw new Error("Error al obtener centrocostos");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchCentrosCostos();
  }, [isMounted]);

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando Centros Costos...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Centros de costos</h1>
      </div>

      {/* 🔹 Tabla */}
      <Tabla columnas={columnas} datos={datos} />
    </div>
  );
}
