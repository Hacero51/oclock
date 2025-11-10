"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Clock, User, Search } from "lucide-react";

export default function MarcacionForm({ onClose }) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [fecha, setFecha] = useState("");
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [estado, setEstado] = useState("completo");
  const [showBuscador, setShowBuscador] = useState(false);
  const [empleados, setEmpleados] = useState([
    {
      id: 1,
      numeroLector: "001",
      documento: "12345678",
      nombreCompleto: "Juan Pérez García",
      cargo: "Analista de Sistemas",
      departamento: "TI",
    },
    {
      id: 2,
      numeroLector: "002",
      documento: "87654321",
      nombreCompleto: "María López Hernández",
      cargo: "Supervisor de Producción",
      departamento: "Producción",
    },
    {
      id: 3,
      numeroLector: "003",
      documento: "11223344",
      nombreCompleto: "Carlos Rodríguez Martínez",
      cargo: "Asistente Administrativo",
      departamento: "Administración",
    },
    {
      id: 4,
      numeroLector: "004",
      documento: "44332211",
      nombreCompleto: "Ana García Silva",
      cargo: "Jefe de Turno",
      departamento: "Operaciones",
    },
    {
      id: 5,
      numeroLector: "005",
      documento: "55667788",
      nombreCompleto: "Pedro Sánchez Vargas",
      cargo: "Técnico Especializado",
      departamento: "Mantenimiento",
    },
  ]);

  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  // Fecha y hora iniciales
  useEffect(() => {
    const ahora = new Date();
    const fechaFormateada = ahora.toISOString().split("T")[0];
    setFecha(fechaFormateada);
    const hora = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");
    setEntrada(`${hora}:${minutos}`);
  }, []);

  // Filtrar empleados
  useEffect(() => {
    if (busquedaEmpleado.trim() === "") {
      setEmpleadosFiltrados([]);
    } else {
      const resultado = empleados.filter((emp) =>
        emp.nombreCompleto.toLowerCase().includes(busquedaEmpleado.toLowerCase())
      );
      setEmpleadosFiltrados(resultado);
    }
  }, [busquedaEmpleado, empleados]);

  const seleccionarEmpleado = (emp) => {
    setEmpleadoSeleccionado(emp);
    setBusquedaEmpleado(emp.nombreCompleto);
    setShowBuscador(false);
  };

  const guardarMarcacion = (e) => {
    e.preventDefault();
    if (!empleadoSeleccionado) {
      alert("Debe seleccionar un empleado");
      return;
    }
    console.log({
      empleado: empleadoSeleccionado,
      fecha,
      entrada,
      salida,
      estado,
    });
    alert("Marcación guardada correctamente");
    onClose?.();
  };

  return (
    <form
      onSubmit={guardarMarcacion}
      className="space-y-6 w-full max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registro de Marcación Manual
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de búsqueda de empleado */}
          <div className="relative space-y-2 md:col-span-2">
            <Label htmlFor="busquedaEmpleado" className="text-sm font-medium">
              Buscar Empleado <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="busquedaEmpleado"
                value={busquedaEmpleado}
                onChange={(e) => {
                  setBusquedaEmpleado(e.target.value);
                  setShowBuscador(true);
                }}
                placeholder="Ingrese nombre o documento..."
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBuscador(!showBuscador)}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {showBuscador && empleadosFiltrados.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full max-h-48 overflow-auto">
                {empleadosFiltrados.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => seleccionarEmpleado(emp)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    <p className="font-medium">{emp.nombreCompleto}</p>
                    <p className="text-gray-500 text-xs">
                      {emp.cargo} — {emp.departamento}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Datos del empleado seleccionado */}
          {empleadoSeleccionado && (
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div>
                <Label className="text-xs text-gray-500">Documento</Label>
                <p className="font-medium">{empleadoSeleccionado.documento}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Número de Lector</Label>
                <p className="font-medium">{empleadoSeleccionado.numeroLector}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Cargo</Label>
                <p className="font-medium">{empleadoSeleccionado.cargo}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Departamento</Label>
                <p className="font-medium">{empleadoSeleccionado.departamento}</p>
              </div>
            </div>
          )}

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-sm font-medium">
              Fecha
            </Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Hora entrada */}
          <div className="space-y-2">
            <Label htmlFor="entrada" className="text-sm font-medium">
              Hora de Entrada
            </Label>
            <Input
              id="entrada"
              type="time"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
            />
          </div>

          {/* Hora salida */}
          <div className="space-y-2">
            <Label htmlFor="salida" className="text-sm font-medium">
              Hora de Salida
            </Label>
            <Input
              id="salida"
              type="time"
              value={salida}
              onChange={(e) => setSalida(e.target.value)}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-sm font-medium">
              Estado
            </Label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
            >
              <option value="completo">Completo</option>
              <option value="incompleto">Incompleto</option>
              <option value="manual">Manual</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="px-6 py-2"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 shadow-md"
        >
          Guardar Marcación
        </Button>
      </div>
    </form>
  );
}
