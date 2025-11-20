"use client";

import { useState, useEffect, useMemo } from "react";
import Tabla from "@/components/Table";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedFilterDialog } from "@/components/advanced-filtrer";
import UpdateModal from "@/components/UpdateModal";

// Componente de controles de paginación local - CORREGIDO
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

  // MOSTRAR SIEMPRE que haya datos, incluso si totalItems es 0
  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600">
          No hay empleados para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} empleados
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
          Empleados por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
        >
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={35}>35</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

export default function EmpleadosPage() {
  const columnas = [
    "Número Lector",
    "Oid",
    "Documento",
    "Nombre a mostrar",
    "Departamento",
    "Turno Actual",
    "Valor Hora",
  ];

  type Empleado = {
    [key: string]: any;
    "Número Lector": string;
    Oid: string;
    Documento: string;
    "Nombre a mostrar": string;
    Departamento: string;
    "Turno Actual": string;
    "Valor Hora": string;
  };

  // Estado general
  const [datos, setDatos] = useState<Empleado[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Paginación local - ESTADO INICIAL CORREGIDO
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Update
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchEmpleados() {
      try {
        const res = await fetch("/api/empleados");
        if (!res.ok) throw new Error("Error al obtener empleados");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    fetchEmpleados();
  }, [isMounted]);

  // Aplicar filtros
  const datosFiltrados = useMemo(() => {
    let filtered = datos;

    if (busqueda) {
      const texto = busqueda.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item["Nombre a mostrar"]?.toLowerCase().includes(texto) ||
          item["Documento"]?.includes(busqueda)
      );
    }

    if (departamento && departamento !== "all") {
      filtered = filtered.filter((i) => i["Departamento"] === departamento);
    }

    if (advancedFilters.length > 0) {
      filtered = filtered.filter((empleado) =>
        advancedFilters.every((filter) => {
          const { field, operator, value, connector } = filter;
          if (!value) return true;
          const empleadoValue = empleado[field]?.toString().toLowerCase() || "";
          const filterValue = value.toLowerCase();

          let condition = false;
          switch (operator) {
            case "igual":
              condition = empleadoValue === filterValue;
              break;
            case "contiene":
              condition = empleadoValue.includes(filterValue);
              break;
            case "empieza":
              condition = empleadoValue.startsWith(filterValue);
              break;
            case "termina":
              condition = empleadoValue.endsWith(filterValue);
              break;
            default:
              condition = true;
          }

          return connector === "No" ? !condition : condition;
        })
      );
    }

    return filtered;
  }, [datos, busqueda, departamento, advancedFilters]);

  // Datos paginados
  const datosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return datosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [datosFiltrados, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, departamento, advancedFilters.length]);

  // Departamentos (Select)
  const departamentos = useMemo(
    () => Array.from(new Set(datos.map((d) => d["Departamento"]))),
    [datos]
  );

  // Limpieza de filtros
  const handleClearAllFilters = () => {
    setBusqueda("");
    setDepartamento("");
    setAdvancedFilters([]);
    setCurrentPage(1);
  };

  // Al hacer click en fila
  const handleRowClick = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setOpenUpdate(true);
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);

  if (!isMounted) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Empleados</h1>
          <p className="text-sm text-gray-600 mt-1">
            {datosFiltrados.length} empleados encontrados
            {datosFiltrados.length !== datos.length && ` (filtrados de ${datos.length} totales)`}
          </p>
        </div>

        <div className="flex gap-2">
          {(busqueda || departamento || advancedFilters.length > 0) && (
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
            className="border-blue-500 text-blue-600"
            onClick={() => setOpenAdvanced(true)}
          >
            ⚙️ Filtros Avanzados
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Buscar por nombre o documento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-md"
        />

        <Select value={departamento} onValueChange={setDepartamento}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrar por departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departamentos.map((dep) => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla con paginación */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Tabla */}
        <div className="overflow-x-auto">
          <Tabla
            columnas={columnas}
            datos={datosPaginados}
            onRowClick={handleRowClick}
          />
        </div>
        
        {/* Controles de paginación - SIEMPRE MOSTRAR */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={datosFiltrados.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Mensaje cuando no hay datos */}
      {datosFiltrados.length === 0 && datos.length > 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron empleados
          </h3>
          <p className="text-gray-500 mb-4">
            No hay empleados que coincidan con los filtros aplicados.
          </p>
          <Button
            variant="outline"
            onClick={handleClearAllFilters}
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}

      {/* Update Modal */}
      {openUpdate && selectedEmpleado && (
        <UpdateModal
          type="empleado"
          data={selectedEmpleado}
          onClose={() => setOpenUpdate(false)}
        />
      )}

      {/* Filtros avanzados */}
      <AdvancedFilterDialog
        open={openAdvanced}
        onOpenChange={setOpenAdvanced}
        onApply={setAdvancedFilters}
      />
    </div>
  );
}
