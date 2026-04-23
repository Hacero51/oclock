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
import { AdvancedFilterDialog } from "@/components/advanced-filtrer";
import type { FilterNode } from "@/components/advanced-filtrer";
import MarcacionForm from "@/components/form/create/MarcacionForm";
import { Dialog } from "@/components/ui/dialog";
import {
  Clock,
  Search,
  Filter,
  X,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Plus,
  RefreshCw,
  Copy,
  FilePlus,
  ExternalLink,
  Download,
  Upload
} from "lucide-react";
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

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
  const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

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

  // Format: DIA, DD DE MM DE YYYY HH:MM AM/PM
  return `${diaSemana}, ${dia} DE ${mes} DE ${año} ${horas}:${minutosStr} ${ampm}`;
};

const parsearFechaHora = (fechaHoraLegible: string) => {
  if (!fechaHoraLegible || fechaHoraLegible === "N/A" || fechaHoraLegible.includes("SIN SALIDA")) return "";
  try {
    // Limpieza agresiva de la cadena
    const clean = fechaHoraLegible.replace(/,/g, '').toUpperCase().trim();
    const partes = clean.split(/\s+/).filter(Boolean);

    // Buscar el número del día (usualmente la segunda o primera parte que sea un número pequeño)
    const diaIdx = partes.findIndex(p => !isNaN(parseInt(p)) && p.length <= 2);
    if (diaIdx === -1) return "";

    const dia = parseInt(partes[diaIdx]);
    const mesNombre = partes[diaIdx + 2] || ""; // Pasa de "15 DE DICIEMBRE"
    const anio = parseInt(partes[diaIdx + 4]);
    const horaMinutoStr = partes[diaIdx + 5] || "";

    const meses: Record<string, number> = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3, 'MAYO': 4, 'JUNIO': 5,
      'JULIO': 6, 'AGOSTO': 7, 'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };
    const mes = meses[mesNombre];

    if (mes === undefined || isNaN(anio) || !horaMinutoStr) return "";

    const [horaStr, minutoStr] = horaMinutoStr.split(':');
    let hora = parseInt(horaStr);
    const minuto = parseInt(minutoStr);

    // Detección robusta de PM/AM
    // Buscamos "P. M.", "PM", "P.M." o simplemente la presencia de "P" después de la hora
    const isPM = /P\.?\s*M\.?|PM/i.test(clean);
    const isAM = /A\.?\s*M\.?|AM/i.test(clean);

    if (isPM && hora < 12) hora += 12;
    if (isAM && hora === 12) hora = 0;

    const fecha = new Date(anio, mes, dia, hora, minuto);
    if (isNaN(fecha.getTime())) return "";

    const lYear = fecha.getFullYear();
    const lMonth = String(fecha.getMonth() + 1).padStart(2, '0');
    const lDay = String(fecha.getDate()).padStart(2, '0');
    const lHour = String(fecha.getHours()).padStart(2, '0');
    const lMin = String(fecha.getMinutes()).padStart(2, '0');

    return `${lYear}-${lMonth}-${lDay}T${lHour}:${lMin}`;
  } catch (error) {
    console.error("Error parseando fecha:", fechaHoraLegible, error);
    return "";
  }
};

const obtenerFechaActual = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  const localISO = new Date(ahora.getTime() - offset).toISOString().slice(0, 16);
  return localISO;
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
  const parsedEntrada = parsearFechaHora(entrada);
  const fechaEntrada = parsedEntrada ? new Date(parsedEntrada) : null;
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
  cedula: string;
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

export default function MarcacionesPage() {
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
  const [openManual, setOpenManual] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salidaEditada, setSalidaEditada] = useState("");
  const [editandoEntradaId, setEditandoEntradaId] = useState<string | null>(null);
  const [entradaEditada, setEntradaEditada] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");
  const [editandoCheckbox, setEditandoCheckbox] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilterRoot, setAdvancedFilterRoot] = useState<FilterNode | undefined>(undefined);
  const [turnosOptions, setTurnosOptions] = useState<{ value: string; label: string }[]>([]);
  const [empleadosOptions, setEmpleadosOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/turnos')
      .then(res => res.json())
      .then(data => {
        const turnoList = Array.isArray(data) ? data : (data.data || []);
        const uniqueShifts = Array.from(new Set(turnoList.map((t: any) => t.Name))).filter(name => !!name);
        setTurnosOptions(uniqueShifts.map(name => ({ value: name as string, label: name as string })));
      }).catch(err => console.error(err));

    fetch('/api/empleados')
      .then(res => res.json())
      .then(data => {
        const empList = Array.isArray(data) ? data : (data.data || []);
        const uniqueNames = Array.from(new Set(empList.map((e: any) => `${e.FirstName} ${e.LastName}`))).filter(name => !!name);
        setEmpleadosOptions(uniqueNames.map(name => ({ value: name as string, label: name as string })));
      }).catch(err => console.error(err));
  }, []);

  const calculateDateRange = (period: string) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();
    switch (period) {
      case "hoy": from = today; to = today; break;
      case "mes_actual": from = new Date(today.getFullYear(), today.getMonth(), 1); to = today; break;
      case "ultimos_30": from.setDate(today.getDate() - 30); to = today; break;
      case "ultimos_60": from.setDate(today.getDate() - 60); to = today; break;
      case "anio_actual": from = new Date(today.getFullYear(), 0, 1); to = today; break;
      case "todos": return { desde: null, hasta: null };
      default: from = new Date(today.getFullYear(), today.getMonth(), 1); to = today;
    }
    const toLocalISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return { desde: toLocalISODate(from), hasta: toLocalISODate(to) };
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
  }, [isMounted, currentPage, itemsPerPage, filtros.periodo, filtros.desde, filtros.hasta, filtros.estado, refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [advancedFilterRoot]);

  useEffect(() => {
    const timer = setTimeout(() => { if (isMounted) fetchMarcaciones(); }, 500);
    return () => clearTimeout(timer);
  }, [filtros.empleado]);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => {
      const nuevosFiltros = { ...prev, [campo]: valor };

      // Si cambia a un periodo predefinido, limpiar fechas personalizadas
      if (campo === 'periodo' && valor !== 'personalizado') {
        nuevosFiltros.desde = "";
        nuevosFiltros.hasta = "";
      }

      // Si selecciona una fecha manualmente, cambiar periodo a personalizado
      if ((campo === 'desde' || campo === 'hasta') && valor !== "") {
        nuevosFiltros.periodo = "personalizado";
      }

      return nuevosFiltros;
    });
    if (campo !== 'empleado') setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setFiltros({ empleado: "", turno: "", estado: "", desde: "", hasta: "", periodo: "mes_actual" });
    setAdvancedFilterRoot(undefined);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const iniciarEdicionSalida = (marcacion: Marcacion) => {
    setEditandoEntradaId(null); // Cancelar edición de entrada
    // Solo permitir editar salida si REALMENTE falta
    const salidaFalta = !marcacion.salida || marcacion.salida === "N/A" || marcacion.salida.includes("SIN SALIDA");

    if (salidaFalta) {
      setEditandoId(marcacion.id);
      setSalidaEditada(obtenerFechaActual());
      setErrorValidacion("");
    }
  };

  const validarEntrada = (entrada: string, salidaVal: string) => {
    if (!entrada) return { valido: false, mensaje: "La entrada no puede estar vacía" };
    const fechaEntrada = new Date(entrada);
    const parsedSalida = parsearFechaHora(salidaVal);
    const fechaSalida = parsedSalida ? new Date(parsedSalida) : null;
    const fechaActual = new Date();

    if (fechaSalida && fechaEntrada > fechaSalida) {
      return { valido: false, mensaje: "La entrada no puede ser posterior a la salida" };
    }
    if (fechaEntrada > fechaActual) {
      return { valido: false, mensaje: "La entrada no puede ser posterior a la fecha actual" };
    }
    return { valido: true, mensaje: "" };
  };

  const handleEntradaChange = (nuevaEntrada: string, marcacion: Marcacion) => {
    setEntradaEditada(nuevaEntrada);
    if (nuevaEntrada) {
      const validacion = validarEntrada(nuevaEntrada, marcacion.salida);
      setErrorValidacion(validacion.valido ? "" : validacion.mensaje);
    } else {
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

  const guardarSalida = async (marcacion: Marcacion) => {
    if (!salidaEditada) { setErrorValidacion("La salida no puede estar vacía"); return; }
    const validacion = validarSalida(salidaEditada, marcacion.entrada, marcacion);
    if (!validacion.valido) { setErrorValidacion(validacion.mensaje); return; }
    try {
      const response = await fetch('/api/marcaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: marcacion.id, salida: salidaEditada })
      });
      if (!response.ok) throw new Error("Error actualizando marcación");
      setRefreshKey(prev => prev + 1);
      setEditandoId(null);
      setSalidaEditada("");
      setErrorValidacion("");
    } catch (error) {
      console.error(error);
      setErrorValidacion("Error al guardar en el servidor");
    }
  };

  const iniciarEdicionEntrada = (marcacion: Marcacion) => {
    setEditandoId(null); // Cancelar edición de salida
    // Solo si entrada está vacía y salida tiene datos
    const entradaVacia = !marcacion.entrada || marcacion.entrada === "N/A" || marcacion.entrada === "-" || marcacion.entrada === "";
    const salidaTieneDatos = marcacion.salida && marcacion.salida !== "N/A" && !marcacion.salida.includes("SIN SALIDA");

    if (entradaVacia && salidaTieneDatos) {
      setEditandoEntradaId(marcacion.id);
      setEntradaEditada(obtenerFechaActual());
      setErrorValidacion("");
    }
  };

  const guardarEntrada = async (marcacion: Marcacion) => {
    if (!entradaEditada) { setErrorValidacion("La entrada no puede estar vacía"); return; }
    const validacion = validarEntrada(entradaEditada, marcacion.salida);
    if (!validacion.valido) { setErrorValidacion(validacion.mensaje); return; }

    try {
      const response = await fetch('/api/marcaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: marcacion.id, entrada: entradaEditada })
      });
      if (!response.ok) throw new Error("Error actualizando marcación");

      setRefreshKey(prev => prev + 1);
      setEditandoEntradaId(null);
      setEntradaEditada("");
      setErrorValidacion("");
    } catch (error) {
      console.error(error);
      setErrorValidacion("Error al guardar en el servidor");
    }
  };

  const handleCheckboxChange = async (marcacionId: string, campo: string, valor: boolean) => {
    try {
      const response = await fetch('/api/marcaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: marcacionId, [campo]: valor })
      });
      if (!response.ok) throw new Error("Error actualizando checkbox");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado");
    }
  };

  const handleDeleteMarcacion = async (id: string) => {
    setIsDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!isDeletingId) return;
    try {
      const response = await fetch(`/api/marcaciones?id=${isDeletingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Error eliminando marcación");
      setRefreshKey(prev => prev + 1);
      setIsDeletingId(null);
      setSelectedRowId(null);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la marcación");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: Nuevo
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setOpenManual(true);
      }
      // Ctrl+D: Suprimir
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (selectedRowId) {
          handleDeleteMarcacion(selectedRowId);
        } else {
          alert("Por favor, seleccione una fila primero para eliminar.");
        }
      }
      // F5: Actualizar
      if (e.key === 'F5') {
        e.preventDefault();
        fetchMarcaciones();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const evaluateFilter = (marcacion: Marcacion, node: FilterNode): boolean => {
    if (node.type === "group") {
      if (!node.children || node.children.length === 0) return true;
      const results = node.children.map(child => evaluateFilter(marcacion, child));
      switch (node.logic) {
        case "AND": return results.every(r => r);
        case "OR": return results.some(r => r);
        default: return true;
      }
    } else {
      if (!node.field || !node.operator) return true;
      const mapping: any = { "Nombre a mostrar": "empleado", "Turno Actual": "turno", "Fecha": "fecha", "Entrada": "entrada", "Salida": "salida" };
      const field = mapping[node.field] || node.field;
      let val: any = marcacion[field as keyof Marcacion] || "";
      const valFiltro = node.value || "";
      if (typeof val === "string") val = val.toLowerCase();
      const valFiltroNorm = valFiltro.toLowerCase();
      switch (node.operator) {
        case "igual": return val === valFiltroNorm;
        case "contiene": return val.includes(valFiltroNorm);
        case "vacio": return !val;
        default: return true;
      }
    }
  };

  const marcacionesFiltradas = useMemo(() => {
    if (!advancedFilterRoot) return marcaciones;
    return marcaciones.filter(m => evaluateFilter(m, advancedFilterRoot));
  }, [marcaciones, advancedFilterRoot]);

  const datosParaTabla = useMemo(() => {
    return marcacionesFiltradas.map((marcacion) => ({
      'Documento': <span className="text-[10px]">{marcacion.cedula}</span>,
      'Empleado': <span className="text-[10px] font-medium">{marcacion.empleado}</span>,
      'Turno': <span className="text-[9px] text-gray-500">{marcacion.turno}</span>,
      'Fecha': <span className="text-[10px]">{marcacion.fecha}</span>,
      'Entrada': (
        <div
          className="min-w-[170px] cursor-pointer"
          onClick={() => { if (editandoEntradaId !== marcacion.id) iniciarEdicionEntrada(marcacion); }}
        >
          {editandoEntradaId === marcacion.id ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <Input
                  autoFocus
                  type="datetime-local"
                  value={entradaEditada}
                  onChange={(e) => handleEntradaChange(e.target.value, marcacion)}
                  className="w-36 text-[10px] h-7"
                />
                <Button size="sm" onClick={() => guardarEntrada(marcacion)} className="bg-green-600 h-8 w-8 p-0"><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditandoEntradaId(null)} className="h-8 w-8 p-0"><X className="h-3.5 w-3.5" /></Button>
              </div>
              {errorValidacion && <div className="text-[10px] text-red-600">{errorValidacion}</div>}
            </div>
          ) : (
            <div
              className={`p-1 px-2 rounded-md border transition-all w-full text-[10px] ${(!marcacion.entrada || marcacion.entrada === "N/A" || marcacion.entrada === "-" || marcacion.entrada === "")
                ? (marcacion.salida && !marcacion.salida.includes("SIN SALIDA") ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" : "bg-gray-100 text-gray-400 border-gray-200")
                : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              title={(!marcacion.entrada || marcacion.entrada === "N/A") && (marcacion.salida && !marcacion.salida.includes("SIN SALIDA")) ? "Haga clic para registrar entrada faltante" : ""}
            >
              {marcacion.entrada || "-"}
            </div>
          )}
        </div>
      ),
      'Salida': (
        <div
          className="min-w-[170px] cursor-pointer"
          onClick={() => { if (editandoId !== marcacion.id) iniciarEdicionSalida(marcacion); }}
        >
          {editandoId === marcacion.id ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <Input
                  autoFocus
                  type="datetime-local"
                  value={salidaEditada}
                  onChange={(e) => handleSalidaChange(e.target.value, marcacion)}
                  className="w-36 text-[10px] h-7"
                />
                <Button size="sm" onClick={() => guardarSalida(marcacion)} className="bg-green-600 h-8 w-8 p-0"><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditandoId(null)} className="h-8 w-8 p-0"><X className="h-3.5 w-3.5" /></Button>
              </div>
              {errorValidacion && <div className="text-[10px] text-red-600">{errorValidacion}</div>}
            </div>
          ) : (
            <div
              className={`p-1 px-2 rounded-md border transition-all w-full text-[10px] ${(!marcacion.salida || marcacion.salida === "N/A" || marcacion.salida.includes("SIN SALIDA"))
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 cursor-pointer hover:bg-yellow-100"
                : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
            >
              {marcacion.salida || "--- SIN SALIDA ---"}
            </div>
          )}
        </div>
      ),
      'Inicia Turno': (
        // @ts-ignore
        <Checkbox checked={marcacion.iniciaTurno} onCheckedChange={(v) => handleCheckboxChange(marcacion.id, 'iniciaTurno', !!v)} />
      ),
      'Extra Después': (
        // @ts-ignore
        <Checkbox checked={marcacion.tiempoExtraDespues} onCheckedChange={(v) => handleCheckboxChange(marcacion.id, 'tiempoExtraDespues', !!v)} />
      ),
      'Extra Festivo': (
        // @ts-ignore
        <Checkbox checked={marcacion.tiempoExtraFestivo} onCheckedChange={(v) => handleCheckboxChange(marcacion.id, 'tiempoExtraFestivo', !!v)} />
      ),
      'Autorizar': (
        // @ts-ignore
        <Checkbox checked={marcacion.autorizar} onCheckedChange={(v) => handleCheckboxChange(marcacion.id, 'autorizar', !!v)} />
      ),
      'Estado': (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${marcacion.estado === "OK"
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-red-100 text-red-700 border border-red-200"
          }`}>
          {marcacion.estado.toUpperCase()}
        </span>
      ),
      id: marcacion.id
    }));
  }, [marcacionesFiltradas, editandoId, salidaEditada, errorValidacion, editandoEntradaId, entradaEditada]);

  if (!isMounted) return null;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200"><Clock className="h-8 w-8 text-royal-blue-600" /></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marcaciones</h1>
            <p className="text-gray-500">{totalItems} marcaciones encontradas</p>
          </div>
        </div>
        <div className="flex gap-3">
          {(filtros.empleado || filtros.desde || filtros.hasta || filtros.estado !== "") && (
            <Button
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleClearAllFilters}
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filtros Avanzados
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <Select
              value={filtros.periodo}
              onValueChange={(value) => handleFiltroChange("periodo", value)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="mes_actual">Mes Actual</SelectItem>
                <SelectItem value="ultimos_30">Últimos 30 días</SelectItem>
                <SelectItem value="ultimos_60">Últimos 60 días</SelectItem>
                <SelectItem value="anio_actual">Año Actual</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Nombre o C.C."
                value={filtros.empleado}
                onChange={(e) => handleFiltroChange("empleado", e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={filtros.desde}
                onChange={(e) => handleFiltroChange("desde", e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={filtros.hasta}
                onChange={(e) => handleFiltroChange("hasta", e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => handleFiltroChange("estado", value)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="OK">Completo</SelectItem>
                <SelectItem value="Incompleto">Incompleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}
        <Tabla
          columnas={['Documento', 'Empleado', 'Turno', 'Fecha', 'Entrada', 'Salida', 'Inicia Turno', 'Extra Después', 'Extra Festivo', 'Autorizar', 'Estado']}
          datos={datosParaTabla}
          selectedRowId={selectedRowId}
          onRowClick={(fila: any) => setSelectedRowId(fila.id)}
          renderContextMenu={(fila: any) => {
            // Buscamos la marcación original para tener los IDs reales
            const m = marcaciones.find(x => x.id === fila.id);
            return (
              <>
                <ContextMenuItem onClick={() => setOpenManual(true)}>
                  <Plus className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Nuevo</span>
                  <ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => { if (m) handleDeleteMarcacion(m.id); }}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  <span>Suprimir</span>
                  <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => {
                  if (m) {
                    const entradaVacia = !m.entrada || m.entrada === "N/A" || m.entrada === "-";
                    if (entradaVacia) iniciarEdicionEntrada(m);
                    else iniciarEdicionSalida(m);
                  }
                }}>
                  <ExternalLink className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Abrir el objeto</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => fetchMarcaciones()}>
                  <RefreshCw className="mr-2 h-4 w-4 text-green-600" />
                  <span>Actualizar</span>
                  <ContextMenuShortcut>F5</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => {
                  // Lógica simple de exportar (ejemplo)
                  console.log("Exportando...");
                }}>
                  <Download className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Exportar</span>
                </ContextMenuItem>
                <ContextMenuItem disabled>
                  <Upload className="mr-2 h-4 w-4 text-gray-400" />
                  <span>Importar de archivo...</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => {
                  if (m) navigator.clipboard.writeText(`${m.empleado} - ${m.entrada} / ${m.salida}`);
                }}>
                  <Copy className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Copia del valor de la celda</span>
                </ContextMenuItem>
              </>
            );
          }}
        />
        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <AdvancedFilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApply={setAdvancedFilterRoot}
        initialFilter={advancedFilterRoot}
        fieldOptions={{ "Turno Actual": turnosOptions, "Nombre a mostrar": empleadosOptions }}
      />

      <Dialog open={openManual} onOpenChange={setOpenManual}>
        <MarcacionForm
          onClose={() => setOpenManual(false)}
          // @ts-ignore
          onSaved={() => fetchMarcaciones()}
        />
      </Dialog>

      <Dialog open={!!isDeletingId} onOpenChange={(open) => !open && setIsDeletingId(null)} size="sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <Trash2 className="h-6 w-6" />
            <h3 className="text-lg font-bold">Confirmar Eliminación</h3>
          </div>
          <p className="text-gray-600 text-sm">
            ¿Está seguro que desea eliminar esta marcación? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeletingId(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Eliminar Registro</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}