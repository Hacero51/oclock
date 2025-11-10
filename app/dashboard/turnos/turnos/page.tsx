"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";

export default function TurnosPage() {
  const columnas = ["Nombre", "Estado"];

  type Turnos = {
    [key: string]: any;
    "Nombre": string;
    "Estado": string;
  };

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

  return (
    <div className="space-y-6 p-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Turnos</h1>
      </div>

      {/* 🔹 Tabla */}
      <Tabla columnas={columnas} datos={datos} />
    </div>
  );
}