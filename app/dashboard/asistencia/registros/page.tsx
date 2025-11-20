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
import Tabla from "@/components/Table";

// Componente de controles de paginación local
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600">
          No hay registros para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} registros
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600 mx-2">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
          Registros por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
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
        // ... agregar más datos según sea necesario
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

  if (!isMounted) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Registro de Tiempo</h1>
          <p className="text-sm text-gray-600 mt-1">
            {registrosFiltrados.length} registros encontrados
            {registrosFiltrados.length !== registros.length && ` (filtrados de ${registros.length} totales)`}
          </p>
        </div>

        <div className="flex gap-2">
          {(filtros.empleado || filtros.fecha || filtros.tipo) && (
            <Button
              variant="outline"
              className="text-gray-600"
              onClick={handleClearAllFilters}
            >
              Limpiar Filtros
            </Button>
          )}

          <Button
            variant="outline"
            className="border-green-500 text-green-600"
            onClick={() => console.log('Exportar')}
          >
            📤 Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
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
              Fecha
            </label>
            <Input
              type="date"
              value={filtros.fecha}
              onChange={(e) => handleFiltroChange("fecha", e.target.value)}
              className="w-full"
            />
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
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Salida">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabla con paginación */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Tabla */}
        <div className="overflow-x-auto">
          {datosParaTabla.length > 0 ? (
            <Tabla 
              columnas={columnas}
              datos={datosParaTabla}
              onRowClick={handleRowClick}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-500 mb-4">
                {registros.length === 0 
                  ? "No hay registros en el sistema." 
                  : "No hay registros que coincidan con los filtros aplicados."
                }
              </p>
              {(filtros.empleado || filtros.fecha || filtros.tipo) && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                >
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