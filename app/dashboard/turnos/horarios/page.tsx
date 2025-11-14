"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";

export default function HorariosPage() {
  const columnas = ["Nombre a mostrar", "Tiempo total", "Tipo"];

  type Horarios = {
    [key: string]: any;
    "Nombre  a mostrar": string;
    "Tiempo total": string;
    "Tipo": string;
  };

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

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando Horarios...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Horarios</h1>
      </div>

      {/* 🔹 Tabla */}
      <Tabla columnas={columnas} datos={datos} onRowClick={() => {}} />
    </div>
  );
}