"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  RefreshCw,
  ChevronDown
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
  const [entrada, setEntrada] = useState("00:00");
  const [salida, setSalida] = useState("00:00");
  const [incluirEntrada, setIncluirEntrada] = useState(true);
  const [incluirSalida, setIncluirSalida] = useState(false); // Por defecto salida desactivada
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

    // Horas en 0 por defecto como solicitó el usuario
    setEntrada("00:00");
    setSalida("00:00");
  }, []);

  // Buscar empleados con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (busquedaEmpleado.length >= 2 && !empleadoSeleccionado) {
        setIsLoadingEmpleados(true);
        try {
          // Filtrar solo trabajadores ACTIVOS
          const res = await fetch(`/api/empleados?status=activo&query=${encodeURIComponent(busquedaEmpleado)}&limit=10`);
          if (res.ok) {
            const json = await res.json();
            // IMPORTANTE: Ahora la API devuelve { data: [], pagination: {} }
            const lista = Array.isArray(json) ? json : (json.data || []);
            setEmpleadosSugeridos(lista);
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
    if (!incluirEntrada && !incluirSalida) {
      setMensaje({ tipo: "error", texto: "Debe incluir al menos una marcación (Entrada o Salida)" });
      return;
    }

    setIsSubmitting(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const payload = {
        empleadoId: empleadoSeleccionado.Oid,
        turnoId: turnoSeleccionado,
        fecha,
        entrada: incluirEntrada ? entrada : null,
        salida: incluirSalida ? salida : null,
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* HEADER PREMIUM */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 p-8 text-white shadow-xl shadow-blue-200">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">Registro de Marcación</h2>
            <p className="text-blue-100 text-sm font-medium opacity-90">Gestión manual de asistencia para personal activo</p>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <Clock className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        {/* Decoración */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl" />
      </div>

      <div className="px-1">
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
            mensaje.tipo === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className={`p-2 rounded-lg ${mensaje.tipo === "success" ? "bg-emerald-200/50" : "bg-rose-200/50"}`}>
              {mensaje.tipo === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <span className="text-sm font-bold">{mensaje.texto}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* BUSCADOR DE EMPLEADO */}
            <div className="space-y-3 relative group">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <User className="w-4 h-4 text-indigo-500" />
                Empleado Solicitante
              </Label>
              <div className="relative transition-all duration-300">
                <Input
                  value={busquedaEmpleado}
                  onChange={(e) => {
                    setBusquedaEmpleado(e.target.value);
                    if (empleadoSeleccionado) resetEmpleado();
                  }}
                  placeholder="Buscar por nombre, apellido o identificación..."
                  className={`pl-12 h-14 text-base rounded-2xl border-gray-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${
                    empleadoSeleccionado ? "bg-indigo-50/50 border-indigo-200 ring-4 ring-indigo-500/5 font-bold text-indigo-900" : ""
                  }`}
                />
                <Search className={`absolute left-4 top-4.5 h-5 w-5 transition-colors ${empleadoSeleccionado ? "text-indigo-500" : "text-gray-400"}`} />
                {empleadoSeleccionado && (
                  <button
                    type="button"
                    onClick={resetEmpleado}
                    className="absolute right-4 top-3.5 bg-white border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-xl text-indigo-600 text-xs font-black shadow-sm transition-all active:scale-95"
                  >
                    CAMBIAR
                  </button>
                )}
              </div>

              {/* Sugerencias desplegables Premium */}
              {showSugerencias && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {isLoadingEmpleados ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-400 uppercase">Buscando en la base de datos...</p>
                    </div>
                  ) : empleadosSugeridos.length > 0 ? (
                    <div className="max-h-[320px] overflow-y-auto">
                      {empleadosSugeridos.map((emp) => (
                        <div
                          key={emp.Oid}
                          onClick={() => seleccionarEmpleado(emp)}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-indigo-50/50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                            {emp["Nombre a mostrar"].charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-gray-900 group-hover:text-indigo-700 transition-colors">{emp["Nombre a mostrar"]}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">{emp.Documento}</span>
                              <span className="text-[10px] font-bold text-gray-400">•</span>
                              <span className="text-[10px] font-bold text-indigo-400 truncate max-w-[150px]">{emp.Departamento}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">No se encontraron resultados</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* TURNO */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Turno Asociado</Label>
                <div className="relative">
                  <select
                    value={turnoSeleccionado}
                    onChange={(e) => setTurnoSeleccionado(e.target.value)}
                    className="w-full h-14 pl-4 pr-10 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-700 appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer hover:border-gray-200"
                    required
                  >
                    <option value="">Seleccione un turno</option>
                    {turnos.map((t) => (
                      <option key={t.Oid} value={t.Oid}>{t.Nombre}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* FECHA */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Fecha de Registro
                </Label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-gray-100 font-bold focus:border-indigo-500 shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* ENTRADA */}
              <div className={`p-5 rounded-2xl border-2 transition-all duration-300 space-y-4 group ${
                incluirEntrada 
                  ? "bg-white border-indigo-100 shadow-sm" 
                  : "bg-gray-50 border-gray-100 opacity-60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="toggleEntrada"
                      checked={incluirEntrada}
                      onChange={(e) => setIncluirEntrada(e.target.checked)}
                      className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                    />
                    <Label htmlFor="toggleEntrada" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer ${
                      incluirEntrada ? "text-indigo-600" : "text-gray-400"
                    }`}>
                      <ArrowRight className="w-3 h-3" />
                      Entrada Programada
                    </Label>
                  </div>
                  <Clock className={`w-4 h-4 transition-colors ${incluirEntrada ? "text-indigo-200" : "text-gray-300"}`} />
                </div>
                <Input
                  type="time"
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  className={`h-12 text-2xl font-black border-none focus:ring-0 ${
                    incluirEntrada ? "bg-indigo-50/30 text-indigo-900" : "bg-gray-100/50 text-gray-400"
                  }`}
                  disabled={!incluirEntrada}
                  required={incluirEntrada}
                />
              </div>

              {/* SALIDA */}
              <div className={`p-5 rounded-2xl border-2 transition-all duration-300 space-y-4 group ${
                incluirSalida 
                  ? "bg-white border-rose-100 shadow-sm" 
                  : "bg-gray-50 border-gray-100 opacity-60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="toggleSalida"
                      checked={incluirSalida}
                      onChange={(e) => setIncluirSalida(e.target.checked)}
                      className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500 border-gray-300 cursor-pointer"
                    />
                    <Label htmlFor="toggleSalida" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer ${
                      incluirSalida ? "text-rose-600" : "text-gray-400"
                    }`}>
                      <ArrowLeft className="w-3 h-3" />
                      Salida Efectiva
                    </Label>
                  </div>
                  <Clock className={`w-4 h-4 transition-colors ${incluirSalida ? "text-rose-200" : "text-gray-300"}`} />
                </div>
                <Input
                  type="time"
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  className={`h-12 text-2xl font-black border-none focus:ring-0 ${
                    incluirSalida ? "bg-rose-50/30 text-rose-900" : "bg-gray-100/50 text-gray-400"
                  }`}
                  disabled={!incluirSalida}
                  required={incluirSalida}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 border-2 border-gray-100 hover:bg-gray-50 text-gray-500 font-black rounded-2xl transition-all active:scale-95"
              disabled={isSubmitting}
            >
              DESCARTAR
            </Button>
            <Button
              type="submit"
              className="flex-[2] h-14 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
              disabled={isSubmitting || !empleadoSeleccionado}
            >
              {isSubmitting ? "PROCESANDO..." : "CONFIRMAR REGISTRO"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
