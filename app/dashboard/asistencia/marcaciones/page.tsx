"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function FormMarcaciones() {
  const [filtros, setFiltros] = useState({
    empleado: "",
    turno: "",
    estado: "",
  });

  // Datos de ejemplo
  const registros = [
    {
      empleado: "MARIA ALEJANDRA AGUILAR MORALES",
      turno: "OFICINA - EXTRAS",
      fecha: "9/11/2025",
      entrada: "DOMINGO, 9 DE NOVIEMBRE DE 2025 6:15 A. M.",
      salida: "DOMINGO, 9 DE NOVIEMBRE DE 2025 10:20 P. M.",
      iniciaTurno: false,
      tiempoExtraDespues: true,
      tiempoExtraFestivo: false,
      autorizar: false,
      estado: "OK",
    },
    {
      empleado: "YESENIA MARGARITA ZÚÑIGA MENDOZA",
      turno: "PLANTA 6 AM - 2 PM",
      fecha: "8/11/2025",
      entrada: "SÁBADO, 8 DE NOVIEMBRE DE 2025 10:23 A. M.",
      salida: "",
      iniciaTurno: true,
      tiempoExtraDespues: false,
      tiempoExtraFestivo: false,
      autorizar: false,
      estado: "Incompleto",
    },
    {
      empleado: "HANS STACY ACRONIE HERNANDEZ",
      turno: "OFICINA - EXTRAS",
      fecha: "8/11/2025",
      entrada: "SÁBADO, 8 DE NOVIEMBRE DE 2025 7:35 A. M.",
      salida: "SÁBADO, 8 DE NOVIEMBRE DE 2025 11:00 A. M.",
      iniciaTurno: true,
      tiempoExtraDespues: true,
      tiempoExtraFestivo: true,
      autorizar: false,
      estado: "OK",
    },
  ];

  const empleados = Array.from(new Set(registros.map((r) => r.empleado)));
  const turnos = Array.from(new Set(registros.map((r) => r.turno)));

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const registrosFiltrados = registros.filter((registro) => {
    const coincideEmpleado =
      !filtros.empleado || filtros.empleado === "all" || registro.empleado === filtros.empleado;
    const coincideTurno =
      !filtros.turno || filtros.turno === "all" || registro.turno === filtros.turno;
    const coincideEstado =
      !filtros.estado || filtros.estado === "all" || registro.estado === filtros.estado;

    return coincideEmpleado && coincideTurno && coincideEstado;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Marcaciones</h1>
          <p className="text-gray-600">Control de entradas, salidas y tiempos extra</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Turno
              </label>
              <Select
                value={filtros.turno}
                onValueChange={(value) => handleFiltroChange("turno", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los turnos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los turnos</SelectItem>
                  {turnos.map((turno) => (
                    <SelectItem key={turno} value={turno}>
                      {turno}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select
                value={filtros.estado}
                onValueChange={(value) => handleFiltroChange("estado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="Incompleto">Incompleto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                Buscar
              </Button>
              <Button
                variant="outline"
                onClick={() => setFiltros({ empleado: "", turno: "", estado: "" })}
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
                  <th className="py-3 px-4 text-left font-medium">Turno</th>
                  <th className="py-3 px-4 text-left font-medium">Fecha</th>
                  <th className="py-3 px-4 text-left font-medium">Entrada</th>
                  <th className="py-3 px-4 text-left font-medium">Salida</th>
                  <th className="py-3 px-4 text-center font-medium">Inicia Turno</th>
                  <th className="py-3 px-4 text-center font-medium">Tiempo Extra Después</th>
                  <th className="py-3 px-4 text-center font-medium">Tiempo Extra Festivo</th>
                  <th className="py-3 px-4 text-center font-medium">Autorizar</th>
                  <th className="py-3 px-4 text-center font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{r.empleado}</td>
                    <td className="py-3 px-4 text-gray-700">{r.turno}</td>
                    <td className="py-3 px-4 text-gray-600">{r.fecha}</td>
                    <td className="py-3 px-4 text-gray-600">{r.entrada}</td>
                    <td className="py-3 px-4 text-gray-600">{r.salida || "--"}</td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox checked={r.iniciaTurno} disabled />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox checked={r.tiempoExtraDespues} disabled />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox checked={r.tiempoExtraFestivo} disabled />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox checked={r.autorizar} disabled />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          r.estado === "OK"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.estado}
                      </span>
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

