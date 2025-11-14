'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Fingerprint, RefreshCcw } from "lucide-react";
import Tabla from "@/components/Table"; // Ajusta la ruta según donde tengas tu componente

export default function DispositivosPage() {
  // Datos de ejemplo (puedes reemplazarlos por datos reales desde tu backend)
  const dispositivos = [
    {
      id: 3,
      nombre: "PRESADOS INR",
      ultimaDescarga: "LUNES, 10 DE NOVIEMBRE DE 2025 4:11 P. M.",
      estado: "Desconectado",
    },
    {
      id: 9,
      nombre: "MOSQUERA NUEVO",
      ultimaDescarga: "MIÉRCOLES, 24 DE ENERO DE 2024 7:02 A. M.",
      estado: "Desconectado",
    },
    {
      id: 89,
      nombre: "MOSQUERA",
      ultimaDescarga: "LUNES, 10 DE NOVIEMBRE DE 2025 4:07 P. M.",
      estado: "Desconectado",
    },
  ];

  // 🎯 PREPARAR DATOS PARA LA TABLA ESTANDARIZADA
  const datosParaTabla = dispositivos.map((dispositivo) => ({
    'Número de Dispositivo': dispositivo.id,
    'Nombre': dispositivo.nombre,
    'Última Descarga': dispositivo.ultimaDescarga,
    'Estado de Conexión': (
      <span className={`font-semibold ${
        dispositivo.estado === "Conectado"
          ? "text-green-600"
          : "text-red-600"
      }`}>
        {dispositivo.estado}
      </span>
    )
  }));

  const columnasTabla = [
    'Número de Dispositivo', 
    'Nombre', 
    'Última Descarga', 
    'Estado de Conexión'
  ];

  // Función para manejar el click en una fila
  const manejarClickFila = (fila) => {
    console.log('Dispositivo clickeado:', fila);
    // Aquí puedes agregar lógica para ver detalles del dispositivo, editar, etc.
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fingerprint className="text-blue-700" size={28} />
          <h1 className="text-2xl font-semibold text-gray-800">Dispositivos</h1>
        </div>

        <Button
          className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2"
        >
          <RefreshCcw size={18} /> Actualizar
        </Button>
      </div>

      {/* Tabla Estándar */}
      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Lista de Dispositivos</CardTitle>
        </CardHeader>

        <CardContent>
          {dispositivos.length > 0 ? (
            <Tabla 
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={manejarClickFila}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay dispositivos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}