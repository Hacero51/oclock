'use client';

import { useState, useEffect, useMemo } from "react";
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
import Tabla from "@/components/Table";
import {
  Clock,
  Search,
  Filter,
  Download,
  X,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Componente de controles de paginación mejorado
function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          No hay marcaciones para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Mostrando {startItem}-{endItem} de {totalItems} marcaciones
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 ${currentPage === pageNum
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && <span className="text-gray-400 mx-1">...</span>}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
          Por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

const formatearFechaHora = (fechaHoraString: string) => {
  if (!fechaHoraString) return "";
  const fecha = new Date(fechaHoraString);
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  const diaSemana = diasSemana[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  let horas = fecha.getHours();
  let minutos = fecha.getMinutes();
  const ampm = horas >= 12 ? 'P. M.' : 'A. M.';
  horas = horas % 12;
  horas = horas ? horas : 12;
  const minutosStr = minutos.toString().padStart(2, '0');
  return `${diaSemana}, ${dia} DE ${mes} DE ${año} ${horas}:${minutosStr} ${ampm}`;
};

const parsearFechaHora = (fechaHoraLegible: string) => {
  if (!fechaHoraLegible) return "";
  try {
    const partes = fechaHoraLegible.split(' ');
    const dia = parseInt(partes[1]);
    const mes = partes[3];
    const año = parseInt(partes[5]);
    const horaMinuto = partes[6];
    const ampm = partes[7] + (partes[8] ? ' ' + partes[8] : '');
    const meses: Record<string, number> = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3,
      'MAYO': 4, 'JUNIO': 5, 'JULIO': 6, 'AGOSTO': 7,
      'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };
    const [horaStr, minutoStr] = horaMinuto.split(':');
    let hora = parseInt(horaStr);
    const minuto = parseInt(minutoStr);
    if (ampm.includes('P. M.') && hora < 12) hora += 12;
    if (ampm.includes('A. M.') && hora === 12) hora = 0;
    const fecha = new Date(año, meses[mes], dia, hora, minuto);
    return fecha.toISOString().slice(0, 16);
  } catch (error) {
    return "";
  }
};

const obtenerFechaActual = () => {
  const ahora = new Date();
  return ahora.toISOString().slice(0, 16);
};

const obtenerFechaMinima = (entrada: string) => {
  if (!entrada) return undefined;
  const fechaEntrada = parsearFechaHora(entrada);
  if (!fechaEntrada) return undefined;
  return fechaEntrada;
};

const validarSalida = (salida: string, entrada: string, marcacion: any) => {
  if (!salida) return { valido: false, mensaje: "La salida no puede estar vacía" };
  const fechaSalida = new Date(salida);
  const fechaEntrada = parsearFechaHora(entrada) ? new Date(parsearFechaHora(entrada)) : null;
  const fechaActual = new Date();
  if (fechaEntrada && fechaSalida < fechaEntrada) {
    return {
      valido: false,
      mensaje: "La salida no puede ser anterior a la entrada"
    };
  }
  if (fechaSalida > fechaActual) {
    return {
      valido: false,
      mensaje: "La salida no puede ser posterior a la fecha y hora actual"
    };
  }
  const diferenciaDias = (fechaActual.getTime() - fechaSalida.getTime()) / (1000 * 60 * 60 * 24);
  if (diferenciaDias > 30) {
    return {
      valido: false,
      mensaje: "No se pueden registrar salidas con más de 30 días de antigüedad"
    };
  }
  if (fechaEntrada) {
    const mismoDia = fechaSalida.getDate() === fechaEntrada.getDate() &&
      fechaSalida.getMonth() === fechaEntrada.getMonth() &&
      fechaSalida.getFullYear() === fechaEntrada.getFullYear();
    if (!mismoDia) {
      return {
        valido: false,
        mensaje: "La salida debe ser del mismo día que la entrada"
      };
    }
  }
  return { valido: true, mensaje: "" };
};

type Marcacion = {
  id: string;
  empleado: string;
  turno: string;
  fecha: string;
  entrada: string;
  salida: string;
  iniciaTurno: boolean;
  tiempoExtraDespues: boolean;
  tiempoExtraFestivo: boolean;
  autorizar: boolean;
  estado: string;
};

export default function FormMarcaciones() {
  const [filtros, setFiltros] = useState({
    empleado: "",
    turno: "",
    estado: "",
    desde: "",
    hasta: "",
    periodo: "mes_actual"
  });

  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salidaEditada, setSalidaEditada] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");
  const [editandoCheckbox, setEditandoCheckbox] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  const calculateDateRange = (period: string) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (period) {
      case "hoy":
        from = today;
        to = today;
        break;
      case "mes_actual":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = today;
        break;
      case "ultimos_30":
        from.setDate(today.getDate() - 30);
        to = today;
        break;
      case "ultimos_60":
        from.setDate(today.getDate() - 60);
        to = today;
        break;
      case "anio_actual":
        from = new Date(today.getFullYear(), 0, 1);
        to = today;
        break;
      case "todos":
        return { desde: null, hasta: null };
      default:
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = today;
    }

    const toLocalISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      desde: toLocalISODate(from),
      hasta: toLocalISODate(to)
    };
  };

  const fetchMarcaciones = async () => {
    if (!isMounted) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (filtros.empleado && filtros.empleado !== "all") params.append("empleado", filtros.empleado);
      if (filtros.estado && filtros.estado !== "all") params.append("estado", filtros.estado);

      if (filtros.periodo === 'personalizado' && filtros.desde && filtros.hasta) {
        params.append("desde", filtros.desde);
        params.append("hasta", filtros.hasta);
      } else if (filtros.periodo && filtros.periodo !== 'personalizado') {
        const { desde, hasta } = calculateDateRange(filtros.periodo);
        if (desde && hasta) {
          params.append("desde", desde);
          params.append("hasta", hasta);
        }
      }

      const response = await fetch(`/api/marcaciones?${params.toString()}`);
      if (!response.ok) throw new Error("Error fetching marcaciones");

      const data = await response.json();
      setMarcaciones(data.data);
      setTotalItems(data.pagination.total);
    } catch (error) {
      console.error("Error cargando marcaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcaciones();
  }, [isMounted, currentPage, itemsPerPage, filtros.periodo, filtros.desde, filtros.hasta, filtros.estado]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted) fetchMarcaciones();
    }, 500);
    return () => clearTimeout(timer);
  }, [filtros.empleado]);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    if (campo !== 'empleado') setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setFiltros({
      empleado: "",
      turno: "",
      estado: "",
      desde: "",
      hasta: "",
      periodo: "mes_actual"
    });
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const iniciarEdicionSalida = (marcacion: Marcacion) => {
    if (marcacion.estado === "Incompleto" || !marcacion.salida) {
      setEditandoId(marcacion.id);
      const salidaInicial = marcacion.salida && marcacion.salida !== "N/A"
        ? parsearFechaHora(marcacion.salida)
        : obtenerFechaActual();
      setSalidaEditada(salidaInicial);
      setErrorValidacion("");
    }
  };

  const handleSalidaChange = (nuevaSalida: string, marcacion: Marcacion) => {
    setSalidaEditada(nuevaSalida);
    if (nuevaSalida) {
      const validacion = validarSalida(nuevaSalida, marcacion.entrada, marcacion);
      setErrorValidacion(validacion.valido ? "" : validacion.mensaje);
    } else {
      setErrorValidacion("");
    }
  };

  const guardarSalida = (marcacion: Marcacion) => {
    if (!salidaEditada) {
      setErrorValidacion("La salida no puede estar vacía");
      return;
    }
    const validacion = validarSalida(salidaEditada, marcacion.entrada, marcacion);
    if (!validacion.valido) {
      setErrorValidacion(validacion.mensaje);
      return;
    }
    const nuevaSalidaFormateada = formatearFechaHora(salidaEditada);
    setMarcaciones(prev => prev.map(m =>
      m.id === marcacion.id
        ? { ...m, salida: nuevaSalidaFormateada, estado: "OK" }
        : m
    ));
    setEditandoId(null);
    setSalidaEditada("");
    setErrorValidacion("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setSalidaEditada("");
    setErrorValidacion("");
  };

  const handleCheckboxChange = (marcacionId: string, campo: string, valor: boolean) => {
    setMarcaciones(prev => prev.map(m =>
      m.id === marcacionId ? { ...m, [campo]: valor } : m
    ));
  };

  const iniciarEdicionCheckbox = (marcacionId: string) => setEditandoCheckbox(marcacionId);
  const finalizarEdicionCheckbox = () => setEditandoCheckbox(null);

  const datosParaTabla = useMemo(() => {
    return marcaciones.map((marcacion) => ({
      'Empleado': marcacion.empleado,
      'Turno': marcacion.turno,
      'Fecha': marcacion.fecha,
      'Entrada': marcacion.entrada,
      'Salida': editandoId === marcacion.id ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={salidaEditada}
              onChange={(e) => handleSalidaChange(e.target.value, marcacion)}
              className="w-48 bg-gray-50 border-gray-300 focus:bg-white"
              max={obtenerFechaActual()}
              min={obtenerFechaMinima(marcacion.entrada)}
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => guardarSalida(marcacion)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!!errorValidacion}
              >
                <CheckCircle2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={cancelarEdicion}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {errorValidacion && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errorValidacion}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`cursor-pointer p-2 rounded-lg border transition-all duration-200 ${(marcacion.estado === "Incompleto" || !marcacion.salida || marcacion.salida === "N/A")
            ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
            : "text-gray-700 border-gray-200 bg-gray-50 hover:bg-gray-100"
            }`}
          onClick={() => iniciarEdicionSalida(marcacion)}
          title={marcacion.estado === "Incompleto" ? "Click para editar salida" : "Salida completa"}
        >
          {marcacion.salida || "--- SIN SALIDA ---"}
        </div>
      ),
      'Inicia Turno': (
        <div
          className="flex justify-center cursor-pointer p-2 rounded-lg border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
        >
          <Checkbox
            checked={marcacion.iniciaTurno}
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'iniciaTurno', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-6 w-6 p-0 hover:bg-green-50"
              onClick={(e) => { e.stopPropagation(); finalizarEdicionCheckbox(); }}
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
        </div>
      ),
      'Tiempo Extra Después': (
        <div
          className="flex justify-center cursor-pointer p-2 rounded-lg border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
        >
          <Checkbox
            checked={marcacion.tiempoExtraDespues}
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'tiempoExtraDespues', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-6 w-6 p-0 hover:bg-green-50"
              onClick={(e) => { e.stopPropagation(); finalizarEdicionCheckbox(); }}
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
        </div>
      ),
      'Tiempo Extra Festivo': (
        <div
          className="flex justify-center cursor-pointer p-2 rounded-lg border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
        >
          <Checkbox
            checked={marcacion.tiempoExtraFestivo}
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'tiempoExtraFestivo', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-6 w-6 p-0 hover:bg-green-50"
              onClick={(e) => { e.stopPropagation(); finalizarEdicionCheckbox(); }}
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
        </div>
      ),
      'Autorizar': (
        <div
          className="flex justify-center cursor-pointer p-2 rounded-lg border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
        >
          <Checkbox
            checked={marcacion.autorizar}
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'autorizar', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-6 w-6 p-0 hover:bg-green-50"
              onClick={(e) => { e.stopPropagation(); finalizarEdicionCheckbox(); }}
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
        </div>
      ),
    }));
  }, [marcaciones, editandoId, salidaEditada, errorValidacion, editandoCheckbox]);

  if (!isMounted) return null;

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                Gestión de Marcaciones
              </h1>
              <p className="mt-2 text-gray-500 font-medium">
                Control y seguimiento de entradas, salidas y tiempos extra
              </p>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-semibold h-11 transition-all active:scale-95"
              >
                <Download className="h-4 w-4 mr-2 text-blue-600" />
                Exportar Reporte
              </Button>
            </div>
          </div>

          {/* Filtros Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Buscar Empleado
                </label>
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Nombre o código..."
                    value={filtros.empleado}
                    onChange={(e) => handleFiltroChange("empleado", e.target.value)}
                    className="pl-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Periodo
                </label>
                <Select
                  value={filtros.periodo}
                  onValueChange={(val) => handleFiltroChange("periodo", val)}
                >
                  <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all hover:bg-white">
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="mes_actual">Mes Actual</SelectItem>
                    <SelectItem value="ultimos_30">Últimos 30 días</SelectItem>
                    <SelectItem value="ultimos_60">Últimos 60 días</SelectItem>
                    <SelectItem value="anio_actual">Este Año</SelectItem>
                    <SelectItem value="personalizado">Rango Personalizado</SelectItem>
                    <SelectItem value="todos">Todos los registros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  Estado de Marcación
                </label>
                <Select
                  value={filtros.estado}
                  onValueChange={(val) => handleFiltroChange("estado", val)}
                >
                  <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all hover:bg-white">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Completado">Completado (E y S)</SelectItem>
                    <SelectItem value="Incompleto">Incompleto (Solo E)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end h-12 mt-7">
                <Button
                  variant="ghost"
                  onClick={handleClearAllFilters}
                  className="w-full h-12 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group"
                >
                  <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Limpiar Filtros
                </Button>
              </div>
            </div>

            {filtros.periodo === 'personalizado' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-xl border border-blue-100/50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider ml-1">Fecha Desde</label>
                  <Input
                    type="date"
                    value={filtros.desde}
                    onChange={(e) => handleFiltroChange("desde", e.target.value)}
                    className="h-11 bg-white border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider ml-1">Fecha Hasta</label>
                  <Input
                    type="date"
                    value={filtros.hasta}
                    onChange={(e) => handleFiltroChange("hasta", e.target.value)}
                    className="h-11 bg-white border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-1.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between px-8">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest py-2">
                Listado de Asistencias
              </span>
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-32">
                  <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Clock className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-gray-900">Cargando datos</span>
                    <span className="text-sm text-gray-500">Esto tomará solo un momento...</span>
                  </div>
                </div>
              ) : (
                <>
                  {datosParaTabla.length > 0 ? (
                    <Tabla
                      columnas={['Empleado', 'Turno', 'Fecha', 'Entrada', 'Salida', 'Inicia Turno', 'Tiempo Extra Después', 'Tiempo Extra Festivo', 'Autorizar']}
                      datos={datosParaTabla}
                      onRowClick={() => { }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-32">
                      <div className="p-6 bg-gray-50 rounded-full border-2 border-dashed border-gray-200">
                        <User className="h-12 w-12 text-gray-300" />
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="text-xl font-bold text-gray-900">No se encontraron marcaciones</h3>
                        <p className="text-gray-500 max-w-sm">
                          Prueba ajustando los filtros de búsqueda o cambia el periodo de tiempo
                        </p>
                        <Button
                          variant="link"
                          onClick={handleClearAllFilters}
                          className="text-blue-600 font-bold hover:no-underline hover:text-blue-700"
                        >
                          Restablecer todos los filtros
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}