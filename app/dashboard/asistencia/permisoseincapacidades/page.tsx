"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function FormPermisosIncapacidades() {
  const [filtros, setFiltros] = useState({
    empleado: "",
    tipo: "",
  });

  // Datos de ejemplo (luego se reemplaza por data del backend)
  const registros = [
    {
      empleado: "WILMAR TAPIAS REINOSO",
      tipo: "CITA MEDICA GENERAL",
      inicio: "MARTES, 14 DE OCTUBRE DE 2025 12:00 A. M.",
      fin: "MARTES, 14 DE OCTUBRE DE 2025 11:59 P. M.",
      pago: true,
    },
    {
      empleado: "MAICOL STIVEN GUZMAN MEJIA",
      tipo: "VACACIONES",
      inicio: "JUEVES, 16 DE OCTUBRE DE 2025 12:00 A. M.",
      fin: "MIÉRCOLES, 22 DE OCTUBRE DE 2025 11:59 P. M.",
      pago: true,
    },
    {
      empleado: "ANDRY DANIELA PARRA URRIAGO",
      tipo: "INCAPACIDAD ENFERMEDAD GENERAL <=3 (66.67%)",
      inicio: "JUEVES, 30 DE OCTUBRE DE 2025 12:00 A. M.",
      fin: "SÁBADO, 1 DE NOVIEMBRE DE 2025 11:59 P. M.",
      pago: true,
    },
    {
      empleado: "OMIARA EDITH RAMIREZ GONZALEZ",
      tipo: "INCAPACIDAD ENFERMEDAD GENERAL >3 (66.67%)",
      inicio: "SÁBADO, 8 DE NOVIEMBRE DE 2025 12:00 A. M.",
      fin: "SÁBADO, 22 DE NOVIEMBRE DE 2025 11:59 P. M.",
      pago: true,
    },
  ];

  const empleados = Array.from(new Set(registros.map((r) => r.empleado)));
  const tipos = Array.from(new Set(registros.map((r) => r.tipo)));

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const registrosFiltrados = registros.filter((r) => {
    const matchEmpleado =
      !filtros.empleado || filtros.empleado === "all" || r.empleado === filtros.empleado;
    const matchTipo = !filtros.tipo || filtros.tipo === "all" || r.tipo === filtros.tipo;
    return matchEmpleado && matchTipo;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Permisos e Incapacidades</h1>
          <p className="text-gray-600">Gestión de ausencias, incapacidades y vacaciones</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado
              </label>
              <Select
                value={filtros.empleado}
                onValueChange={(value) => handleFiltroChange("empleado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {empleados.map((empleado) => (
                    <SelectItem key={empleado} value={empleado}>
                      {empleado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => handleFiltroChange("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                Buscar
              </Button>
              <Button
                variant="outline"
                onClick={() => setFiltros({ empleado: "", tipo: "" })}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-700">
                  <th className="py-3 px-4 text-left font-medium">Empleado</th>
                  <th className="py-3 px-4 text-left font-medium">Tipo</th>
                  <th className="py-3 px-4 text-left font-medium">Inicio</th>
                  <th className="py-3 px-4 text-left font-medium">Fin</th>
                  <th className="py-3 px-4 text-center font-medium">Pago</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{r.empleado}</td>
                    <td className="py-3 px-4 text-gray-700">{r.tipo}</td>
                    <td className="py-3 px-4 text-gray-600">{r.inicio}</td>
                    <td className="py-3 px-4 text-gray-600">{r.fin}</td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox checked={r.pago} disabled />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center text-sm text-gray-600">
            <span>
              Mostrando {registrosFiltrados.length} de {registros.length} registros
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Exportar Excel
              </Button>
              <Button variant="outline" size="sm">
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
