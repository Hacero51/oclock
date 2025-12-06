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

// ... (las funciones auxiliares se mantienen igual)
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
  [key: string]: any;
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
  });

  // Estado para datos y paginación
  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salidaEditada, setSalidaEditada] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");

  // Estado para edición de checkboxes
  const [editandoCheckbox, setEditandoCheckbox] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  // Simular carga de datos
  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      const datosEjemplo: Marcacion[] = [
        {
          id: "1",
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
          id: "2",
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
          id: "3",
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
      setMarcaciones(datosEjemplo);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMounted]);

  // Aplicar filtros
  const marcacionesFiltradas = useMemo(() => {
    let filtered = marcaciones;
    if (filtros.empleado && filtros.empleado !== "all") {
      filtered = filtered.filter(marcacion => marcacion.empleado === filtros.empleado);
    }
    if (filtros.turno && filtros.turno !== "all") {
      filtered = filtered.filter(marcacion => marcacion.turno === filtros.turno);
    }
    if (filtros.estado && filtros.estado !== "all") {
      filtered = filtered.filter(marcacion => marcacion.estado === filtros.estado);
    }
    return filtered;
  }, [marcaciones, filtros.empleado, filtros.turno, filtros.estado]);

  // Datos paginados
  const marcacionesPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return marcacionesFiltradas.slice(startIndex, startIndex + itemsPerPage);
  }, [marcacionesFiltradas, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtros.empleado, filtros.turno, filtros.estado]);

  // Empleados y turnos para los selects
  const empleados = useMemo(
    () => Array.from(new Set(marcaciones.map(m => m.empleado))),
    [marcaciones]
  );

  const turnos = useMemo(
    () => Array.from(new Set(marcaciones.map(m => m.turno))),
    [marcaciones]
  );

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpieza de filtros
  const handleClearAllFilters = () => {
    setFiltros({ empleado: "", turno: "", estado: "" });
    setCurrentPage(1);
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Iniciar edición de salida
  const iniciarEdicionSalida = (marcacion: Marcacion) => {
    if (marcacion.estado === "Incompleto" || !marcacion.salida) {
      setEditandoId(marcacion.id);
      const salidaInicial = marcacion.salida
        ? parsearFechaHora(marcacion.salida)
        : obtenerFechaActual();
      setSalidaEditada(salidaInicial);
      setErrorValidacion("");
    }
  };

  // Validar en tiempo real mientras se edita
  const handleSalidaChange = (nuevaSalida: string, marcacion: Marcacion) => {
    setSalidaEditada(nuevaSalida);
    if (nuevaSalida) {
      const validacion = validarSalida(nuevaSalida, marcacion.entrada, marcacion);
      setErrorValidacion(validacion.valido ? "" : validacion.mensaje);
    } else {
      setErrorValidacion("");
    }
  };

  // Guardar salida editada
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
        ? {
          ...m,
          salida: nuevaSalidaFormateada,
          estado: "OK"
        }
        : m
    ));
    setEditandoId(null);
    setSalidaEditada("");
    setErrorValidacion("");
  };

  // Cancelar edición de salida
  const cancelarEdicion = () => {
    setEditandoId(null);
    setSalidaEditada("");
    setErrorValidacion("");
  };

  // Manejar cambio de checkbox
  const handleCheckboxChange = (marcacionId: string, campo: string, valor: boolean) => {
    setMarcaciones(prev => prev.map(m =>
      m.id === marcacionId
        ? { ...m, [campo]: valor }
        : m
    ));
  };

  // Iniciar edición de checkbox
  const iniciarEdicionCheckbox = (marcacionId: string) => {
    setEditandoCheckbox(marcacionId);
  };

  // Finalizar edición de checkbox
  const finalizarEdicionCheckbox = () => {
    setEditandoCheckbox(null);
  };

  // Preparar datos para la tabla
  const datosParaTabla = useMemo(() => {
    return marcacionesPaginadas.map((marcacion) => ({
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
              <Button
                size="sm"
                variant="outline"
                onClick={cancelarEdicion}
              >
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
          className={`cursor-pointer p-2 rounded-lg border transition-all duration-200 ${(marcacion.estado === "Incompleto" || !marcacion.salida)
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
          title="Click para editar"
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
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
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
          title="Click para editar"
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
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
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
          title="Click para editar"
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
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
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
          title="Click para editar"
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
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
        </div>
      ),
      'Estado': (
        <div className="flex justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${marcacion.estado === "OK"
                ? "bg-green-100 text-green-800"
                : marcacion.estado === "Incompleto"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
          >
            {marcacion.estado === "OK" && <CheckCircle2 className="h-3 w-3" />}
            {marcacion.estado === "Incompleto" && <AlertCircle className="h-3 w-3" />}
            {marcacion.estado}
          </span>
        </div>
      )
    }));
  }, [marcacionesPaginadas, editandoId, salidaEditada, errorValidacion, editandoCheckbox]);

  const columnasTabla = [
    'Empleado',
    'Turno',
    'Fecha',
    'Entrada',
    'Salida',
    'Inicia Turno',
    'Tiempo Extra Después',
    'Tiempo Extra Festivo',
    'Autorizar',
    'Estado'
  ];

  const totalPages = Math.ceil(marcacionesFiltradas.length / itemsPerPage);

  if (!isMounted) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-gray-400 animate-pulse" />
        </div>
        <p className="text-gray-500">Cargando marcaciones...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marcaciones</h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {marcacionesFiltradas.length} registros encontrados
              </span>
              {marcacionesFiltradas.length !== marcaciones.length && (
                <span className="text-gray-400">•</span>
              )}
              {marcacionesFiltradas.length !== marcaciones.length && (
                <span className="text-gray-500 text-xs">
                  Filtrados de {marcaciones.length} totales
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {(filtros.empleado || filtros.turno || filtros.estado) && (
            <Button
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleClearAllFilters}
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado
            </label>
            <Select
              value={filtros.empleado}
              onValueChange={(value) => handleFiltroChange("empleado", value)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {empleados.map((empleado) => (
                  <SelectItem key={empleado} value={empleado}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {empleado}
                    </div>
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
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
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
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="Incompleto">Incompleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla con paginación */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabla */}
        <div className="overflow-x-auto">
          {datosParaTabla.length > 0 ? (
            <Tabla
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={() => { }}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron marcaciones
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {marcaciones.length === 0
                  ? "No hay marcaciones en el sistema."
                  : "No hay marcaciones que coincidan con los filtros aplicados."
                }
              </p>
              {(filtros.empleado || filtros.turno || filtros.estado) && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar todos los filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Controles de paginación */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={marcacionesFiltradas.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}