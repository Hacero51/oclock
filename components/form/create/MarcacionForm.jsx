"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  User,
  Search,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function MarcacionForm({ onClose, onSaved }) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [empleadosSugeridos, setEmpleadosSugeridos] = useState([]);
  const [isLoadingEmpleados, setIsLoadingEmpleados] = useState(false);
  const [showSugerencias, setShowSugerencias] = useState(false);

  const [turnos, setTurnos] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("");

  const [fecha, setFecha] = useState("");
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // Cargar turnos al montar
  useEffect(() => {
    fetch('/api/turnos')
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.data || []);
        setTurnos(lista);
      })
      .catch(err => console.error("Error cargando turnos:", err));

    // Fecha actual por defecto
    const ahora = new Date();
    const fechaISO = ahora.toISOString().split("T")[0];
    setFecha(fechaISO);

    const hora = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");
    setEntrada(`${hora}:${minutos}`);
  }, []);

  // Buscar empleados con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (busquedaEmpleado.length >= 2 && !empleadoSeleccionado) {
        setIsLoadingEmpleados(true);
        try {
          // Filtrar solo trabajadores ACTIVOS
          const res = await fetch(`/api/empleados?status=activo&query=${encodeURIComponent(busquedaEmpleado)}`);
          if (res.ok) {
            const data = await res.json();
            setEmpleadosSugeridos(data);
            setShowSugerencias(true);
          }
        } catch (error) {
          console.error("Error buscando empleados:", error);
        } finally {
          setIsLoadingEmpleados(false);
        }
      } else {
        setEmpleadosSugeridos([]);
        setShowSugerencias(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [busquedaEmpleado, empleadoSeleccionado]);

  const seleccionarEmpleado = (emp) => {
    setEmpleadoSeleccionado(emp);
    setBusquedaEmpleado(emp["Nombre a mostrar"]);
    setShowSugerencias(false);

    // Si el empleado tiene un turno asignado, seleccionarlo por defecto
    if (emp["Turno Actual"]) {
      const turnoEncontrado = turnos.find(t => t.Nombre === emp["Turno Actual"]);
      if (turnoEncontrado) setTurnoSeleccionado(turnoEncontrado.Oid);
    }
  };

  const resetEmpleado = () => {
    setEmpleadoSeleccionado(null);
    setBusquedaEmpleado("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empleadoSeleccionado) {
      setMensaje({ tipo: "error", texto: "Debe seleccionar un empleado activo" });
      return;
    }
    if (!turnoSeleccionado) {
      setMensaje({ tipo: "error", texto: "Debe seleccionar un turno" });
      return;
    }

    setIsSubmitting(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const payload = {
        empleadoId: empleadoSeleccionado.Oid,
        turnoId: turnoSeleccionado,
        fecha,
        entrada,
        salida: salida || null, // Salida opcional
      };

      const res = await fetch('/api/marcaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Registro manual creado exitosamente" });
        setTimeout(() => {
          if (onSaved) onSaved();
          if (onClose) onClose();
        }, 1500);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar la marcación");
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-2">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Registro de Marcación Manual</h2>
        <p className="text-sm text-gray-500">Cree un registro de asistencia para trabajadores activos</p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${mensaje.tipo === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
          {mensaje.tipo === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{mensaje.texto}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* BUSCADOR DE EMPLEADO */}
          <div className="space-y-2 relative">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Empleado (Solo Activos)
            </Label>
            <div className="relative">
              <Input
                value={busquedaEmpleado}
                onChange={(e) => {
                  setBusquedaEmpleado(e.target.value);
                  if (empleadoSeleccionado) resetEmpleado();
                }}
                placeholder="Escriba nombre o cédula..."
                className={`pl-10 h-11 ${empleadoSeleccionado ? "bg-blue-50 border-blue-200 font-medium" : ""}`}
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              {empleadoSeleccionado && (
                <button
                  type="button"
                  onClick={resetEmpleado}
                  className="absolute right-3 top-3 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded text-gray-600 font-medium"
                >
                  Cambiar
                </button>
              )}
            </div>

            {/* Sugerencias desplegables */}
            {showSugerencias && empleadosSugeridos.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {empleadosSugeridos.map((emp) => (
                  <div
                    key={emp.Oid}
                    onClick={() => seleccionarEmpleado(emp)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {emp["Nombre a mostrar"].charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{emp["Nombre a mostrar"]}</p>
                      <p className="text-xs text-gray-500">{emp.Documento} • {emp.Departamento}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSugerencias && empleadosSugeridos.length === 0 && !isLoadingEmpleados && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500 shadow-xl">
                No se encontraron trabajadores activos
              </div>
            )}
            {isLoadingEmpleados && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500 shadow-xl">
                Buscando...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TURNO */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Turno Asociado</Label>
              <select
                value={turnoSeleccionado}
                onChange={(e) => setTurnoSeleccionado(e.target.value)}
                className="w-full h-11 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Seleccione un turno</option>
                {turnos.map((t) => (
                  <option key={t.Oid} value={t.Oid}>{t.Nombre}</option>
                ))}
              </select>
            </div>

            {/* FECHA */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Fecha
              </Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-11 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* ENTRADA */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <Label className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                Hora de Entrada
              </Label>
              <Input
                type="time"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                className="h-12 text-xl font-bold bg-white"
                required
              />
            </div>

            {/* SALIDA */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <Label className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Hora de Salida (Opcional)
              </Label>
              <Input
                type="time"
                value={salida}
                onChange={(e) => setSalida(e.target.value)}
                className="h-12 text-xl font-bold bg-white placeholder:text-gray-300"
                placeholder="--:--"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
            disabled={isSubmitting || !empleadoSeleccionado}
          >
            {isSubmitting ? "Guardando..." : "Crear Registro"}
          </Button>
        </div>
      </form>
    </div>
  );
}
