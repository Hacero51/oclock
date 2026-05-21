'use client';

import { useState, useEffect, useMemo, useContext, useRef } from "react";
import * as XLSX from "xlsx";
import { DashboardContext } from "@/app/dashboard/layout";
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
import {
  Clock,
  Search,
  Filter,
  Download,
  X,
  Calendar,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";


// Componente de controles de paginación mejorado
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationControlsProps) {
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
  const { refreshTrigger } = useContext(DashboardContext);
  const [filtros, setFiltros] = useState({
    empleado: "",
    desde: "",
    hasta: "",
    tipo: "",
    periodo: "mes_actual"
  });

  // Estado para datos y paginación
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Modal Update
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);

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
      case "personalizado":
        return { desde: null, hasta: null }; // Se usa filtros.fecha
      default:
        from = new Date(today.getFullYear(), today.getMonth(), 1); // Default mes actual
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

  const fetchRegistros = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (filtros.empleado && filtros.empleado !== "all") params.append("empleado", filtros.empleado);
      if (filtros.tipo && filtros.tipo !== "all") params.append("tipo", filtros.tipo);

      // Lógica de fechas
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

      const response = await fetch(`/api/registros?${params.toString()}`);
      if (!response.ok) throw new Error("Error fetching registros");

      const data = await response.json();
      setRegistros(data.data);
      setTotalItems(data.pagination.total);
    } catch (error) {
      console.error("Error cargando registros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(fetchRegistros, 300); // Debounce simple
    return () => clearTimeout(timer);
  }, [itemsPerPage, currentPage, filtros, isMounted, refreshKey, refreshTrigger]);

  // Limpiar filtros
  const handleClearAllFilters = () => {
    setFiltros({ empleado: "", desde: "", hasta: "", tipo: "", periodo: "mes_actual" });
    setCurrentPage(1);
  };

  // Al hacer click en fila
  const handleRowClick = (registro: Registro) => {
    // Necesitamos pasarle el tiempo original ISO al modal para que el input datetime-local funcione
    setSelectedRegistro(registro);
    setOpenUpdate(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedRegistro) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/registros', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRegistro.id,
          checkTime: selectedRegistro.tiempo,
          checkType: selectedRegistro.tipo
        })
      });

      if (!response.ok) throw new Error("Error actualizando registro");

      setOpenUpdate(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error guardando actualización:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };


  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filtros.empleado && filtros.empleado !== "all") params.append("empleado", filtros.empleado);
      if (filtros.tipo && filtros.tipo !== "all") params.append("tipo", filtros.tipo);
      
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
      params.append("export", "true");

      const response = await fetch(`/api/registros?${params.toString()}`);
      if (!response.ok) throw new Error("Error obteniendo datos para exportar");

      const resData = await response.json();
      const exportData = resData.data.map((r: any) => ({
        "Empleado": r.empleado,
        "Documento": r.documento || "", // Agregado en caso de existir, para la plantilla
        "FechaHora": r.tiempo,
        "Tipo": r.tipo,
        "Dispositivo": r.lector
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
      XLSX.writeFile(workbook, `registros_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      alert("Error al exportar los datos.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { Documento: "123456789", Empleado: "Juan Perez", FechaHora: "2024-01-01 08:00", Tipo: "Entrada" },
      { Documento: "987654321", Empleado: "Maria Gomez", FechaHora: "2024-01-01 17:00", Tipo: "Salida" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Registros");
    XLSX.writeFile(workbook, "Plantilla_Importacion_Registros.xlsx");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const response = await fetch('/api/importar/registros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registros: data })
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.mensaje + (result.errores.length ? "\nErrores (hasta 10):\n" + result.errores.join("\n") : ""));
          setRefreshKey(prev => prev + 1);
        } else {
          alert("Error: " + result.error);
        }
      } catch (error) {
        console.error("Error importando excel:", error);
        alert("Hubo un error al procesar el archivo Excel.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => {
      const nuevosFiltros = { ...prev, [campo]: valor };

      // Si cambia a periodo no personalizado, limpiar fecha específica visualmente
      if (campo === 'periodo' && valor !== 'personalizado') {
        nuevosFiltros.desde = "";
        nuevosFiltros.hasta = "";
      }

      // Si el usuario selecciona una fecha manualmente, cambiar periodo a personalizado automáticamente
      if ((campo === 'desde' || campo === 'hasta') && valor !== "") {
        nuevosFiltros.periodo = "personalizado";
      }

      return nuevosFiltros;
    });
    setCurrentPage(1); // Resetear a pag 1 al filtrar
  };

  // Preparar datos para la tabla
  const datosParaTabla = useMemo(() => {
    return registros.map((registro) => {
      const dateObj = new Date(registro.tiempo);

      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

      const diaSemana = diasSemana[dateObj.getUTCDay()];
      const dia = dateObj.getUTCDate();
      const mes = meses[dateObj.getUTCMonth()];
      const año = dateObj.getUTCFullYear();

      let horas = dateObj.getUTCHours();
      let minutos = dateObj.getUTCMinutes();
      const ampm = horas >= 12 ? 'P. M.' : 'A. M.';
      horas = horas % 12;
      horas = horas ? horas : 12;
      const minutosStr = minutos.toString().padStart(2, '0');

      // Format: DIA, DD DE MM DE YYYY HH:MM AM/PM
      const fechaFormateada = `${diaSemana}, ${dia} DE ${mes} DE ${año} ${horas}:${minutosStr} ${ampm}`;

      return {
        'Empleado': <span className="text-xs font-medium">{registro.empleado}</span>,
        'Tiempo': <span className="text-xs">{fechaFormateada}</span>,
        'Tipo': (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${registro.tipo === "Entrada"
            ? "bg-green-100 text-green-800"
            : (registro.tipo === "Salida" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800")
            }`}>
            {registro.tipo}
          </span>
        ),
        'Año': <span className="text-xs">{registro.año}</span>,
        'Mes': <span className="text-xs">{registro.mes}</span>,
        'Método de Verificación': (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
            {registro.metodoverificacion}
          </span>
        ),
        'Lector': <span className="text-[10px] text-gray-500">{registro.lector}</span>
      };
    });
  }, [registros]);

  const columnas = [
    'Empleado',
    'Tiempo',
    'Tipo',
    'Año',
    'Mes',
    'Método de Verificación',
    'Lector'
  ];

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
                {totalItems} registros encontrados
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {(filtros.empleado || filtros.desde || filtros.hasta || filtros.tipo) && (
            <Button
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleClearAllFilters}
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}

          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Plantilla</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="text-blue-600 border-blue-300 hover:bg-blue-50 flex items-center gap-2"
          >
            {isImporting ? <Clock className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-2"
          >
            {isExporting ? <Clock className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre..."
                value={filtros.empleado}
                onChange={(e) => handleFiltroChange("empleado", e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto">
          {registros.length > 0 ? (
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
                {totalItems === 0 && !isLoading
                  ? "No hay registros que coincidan con los filtros aplicados."
                  : "Cargando..."
                }
              </p>
              {(filtros.empleado || filtros.desde || filtros.hasta || filtros.tipo) && (
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
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}