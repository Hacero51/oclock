'use client';

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/Input.JSX";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Tabla from "@/components/Table";
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  X, 
  Calendar,
  User,
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
          No hay registros para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Mostrando {startItem}-{endItem} de {totalItems} registros
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
                className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 ${
                  currentPage === pageNum
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

type Registro = {
  [key: string]: any;
  empleado: string;
  tiempo: string;
  tipo: string;
  año: number;
  mes: number;
  metodoverificacion: string;
  lector: string;
};

export default function RegistroTiempoForm() {
  const [filtros, setFiltros] = useState({
    empleado: "",
    fecha: "",
    tipo: ""
  });

  // Estado para datos y paginación
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Update
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);

  useEffect(() => setIsMounted(true), []);

  // Simular carga de datos
  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      // Datos de ejemplo con múltiples empleados
      const datosEjemplo: Registro[] = [
        {
          empleado: "Johana andrea jimenez rodriguez",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "Johana andrea jimenez rodriguez",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "DAGER OCORO RAMIREZ",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "ENILSON ANDRES YEPES VEGA",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "LUZ ESTELA RODRIGUEZ MANCO",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "DIANA KATERINE RIAÑO MERCHAN",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "JUAN STEEVEN CAMARGO MORENO",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "DARLY DAVID GOMEZ MENDOZA",
          tiempo: "LUNES, 12 DE NOVIEMBRE DE 2025 5:48 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "VICENSIO ANGULO ROJAS",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
        {
          empleado: "BRAYAN STIVEN GUTIERREZ AMORTEGUI",
          tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
          tipo: "Entrada",
          año: 2025,
          mes: 11,
          metodoverificacion: "Huella",
          lector: "mosquera",
        },
      ];
      
      setRegistros(datosEjemplo);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMounted]);

  // Función para extraer la fecha del campo tiempo y formatearla para comparar
  const extraerFechaDeTiempo = (tiempo: string) => {
    const partes = tiempo.split(' ');
    if (partes.length >= 6) {
      const dia = partes[1];
      const mes = partes[3];
      const año = partes[5];
      
      const meses: Record<string, string> = {
        'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
        'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
        'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
      };
      
      const mesNumero = meses[mes] || '01';
      return `${año}-${mesNumero}-${dia.padStart(2, '0')}`;
    }
    return '';
  };

  // Aplicar filtros
  const registrosFiltrados = useMemo(() => {
    let filtered = registros;

    if (filtros.empleado && filtros.empleado !== "all") {
      filtered = filtered.filter(registro => registro.empleado === filtros.empleado);
    }

    if (filtros.tipo && filtros.tipo !== "all") {
      filtered = filtered.filter(registro => registro.tipo === filtros.tipo);
    }

    if (filtros.fecha) {
      filtered = filtered.filter(registro => {
        const fechaRegistro = extraerFechaDeTiempo(registro.tiempo);
        return fechaRegistro === filtros.fecha;
      });
    }

    return filtered;
  }, [registros, filtros.empleado, filtros.tipo, filtros.fecha]);

  // Datos paginados
  const registrosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return registrosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [registrosFiltrados, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtros.empleado, filtros.tipo, filtros.fecha]);

  // Empleados para el select
  const empleados = useMemo(
    () => Array.from(new Set(registros.map(r => r.empleado))),
    [registros]
  );

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpieza de filtros
  const handleClearAllFilters = () => {
    setFiltros({ empleado: "", fecha: "", tipo: "" });
    setCurrentPage(1);
  };

  // Al hacer click en fila
  const handleRowClick = (registro: Registro) => {
    setSelectedRegistro(registro);
    setOpenUpdate(true);
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Preparar datos para la tabla
  const datosParaTabla = useMemo(() => {
    return registrosPaginados.map((registro) => ({
      'Empleado': registro.empleado,
      'Tiempo': registro.tiempo,
      'Tipo': (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          registro.tipo === "Entrada" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {registro.tipo}
        </span>
      ),
      'Año': registro.año,
      'Mes': registro.mes,
      'Método de Verificación': (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {registro.metodoverificacion}
        </span>
      ),
      'Lector': registro.lector
    }));
  }, [registrosPaginados]);

  const columnas = [
    'Empleado', 
    'Tiempo', 
    'Tipo', 
    'Año', 
    'Mes', 
    'Método de Verificación', 
    'Lector'
  ];

  const totalPages = Math.ceil(registrosFiltrados.length / itemsPerPage);

  if (!isMounted) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-gray-400 animate-pulse" />
        </div>
        <p className="text-gray-500">Cargando registros...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Registro de Tiempo</h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {registrosFiltrados.length} registros encontrados
              </span>
              {registrosFiltrados.length !== registros.length && (
                <span className="text-gray-400">•</span>
              )}
              {registrosFiltrados.length !== registros.length && (
                <span className="text-gray-500 text-xs">
                  Filtrados de {registros.length} totales
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {(filtros.empleado || filtros.fecha || filtros.tipo) && (
            <Button
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleClearAllFilters}
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}

          <Button
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={filtros.fecha}
                onChange={(e) => handleFiltroChange("fecha", e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <Select 
              value={filtros.tipo} 
              onValueChange={(value) => handleFiltroChange("tipo", value)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Salida">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabla con paginación */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabla */}
        <div className="overflow-x-auto">
          {datosParaTabla.length > 0 ? (
            <Tabla 
              columnas={columnas}
              datos={datosParaTabla}
              onRowClick={handleRowClick}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {registros.length === 0 
                  ? "No hay registros en el sistema." 
                  : "No hay registros que coincidan con los filtros aplicados."
                }
              </p>
              {(filtros.empleado || filtros.fecha || filtros.tipo) && (
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
          totalItems={registrosFiltrados.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}