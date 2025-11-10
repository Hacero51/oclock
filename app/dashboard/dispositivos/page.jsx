"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Fingerprint, RefreshCcw } from "lucide-react";

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

      {/* Tabla */}
      <Card className="shadow-md border border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Lista de Dispositivos</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="p-3 text-left w-1/6">Número de Dispositivo</th>
                  <th className="p-3 text-left w-1/3">Nombre</th>
                  <th className="p-3 text-left w-1/3">Última Descarga</th>
                  <th className="p-3 text-left w-1/6">Estado de Conexión</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((d, index) => (
                  <tr
                    key={d.id}
                    className={`border-t hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-gray-50/40" : "bg-white"
                    }`}
                  >
                    <td className="p-3">{d.id}</td>
                    <td className="p-3 font-medium text-gray-800">{d.nombre}</td>
                    <td className="p-3 text-gray-600">{d.ultimaDescarga}</td>
                    <td
                      className={`p-3 font-semibold ${
                        d.estado === "Conectado"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {d.estado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
