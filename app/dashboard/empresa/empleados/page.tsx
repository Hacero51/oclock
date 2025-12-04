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
import {
  Search,
  Filter,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
// ---------------- PAGINACIÓN ---------------- //

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          No hay empleados para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Mostrando {startItem}-{endItem} de {totalItems} empleados
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
        <label className="text-sm text-gray-600">Por página:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
        >
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
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
  const { estadoEmpleados } = useContext(DashboardContext);
  const [datos, setDatos] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState([]);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchData() {
      try {
        const res = await fetch("/api/empleados");
        if (!res.ok) throw new Error("Error al obtener empleados");

        const data = await res.json();

        // Normaliza los nombres que tu frontend usa (ajusta si tu API tiene otros keys)
        const normalizados = data.map((e) => ({
          "Número Lector": e.ReaderNumber ?? e["Número Lector"] ?? e.AcNumber ?? "",
          Oid: e.Oid,
          Documento: e.Document ?? e.DocumentNumber ?? e["Documento"] ?? "",
          "Nombre a mostrar": e.DisplayName ?? e.FullName ?? e["Nombre a mostrar"] ?? "",
          Departamento: e.DepartmentName ?? e.Department ?? e["Departamento"] ?? "",
          "Turno Actual": e.CurrentShiftName ?? e.CurrentShift ?? e["Turno Actual"] ?? "",
          "Valor Hora": e.ValorHora ?? e["Valor Hora"] ?? "",
          Status: typeof e.Status !== "undefined" ? e.Status : (e.StatusId ?? null), // asegúrate que venga el campo
        }));

        //console.log("Empleados cargados con STATUS:", normalizados.map(e => ({
        //  name: e["Nombre a mostrar"],
        //status: e.Status
        //})));

        // Filtrar registros vacíos del mapeo
        const filtrados = normalizados.filter(
          (r) =>
            r["Nombre a mostrar"]?.toString().trim() !== "" &&
            r["Documento"]?.toString().trim() !== "" &&
            r["Departamento"]?.toString().trim() !== ""
        );
        setDatos(filtrados);
      } catch (err) {
        console.error("Error cargando empleados:", err);
      }
    }

    fetchData();
  }, [isMounted]);

  const datosFiltrados = useMemo(() => {
    let filtered = datos;

    // ✔️ CORREGIDO SEGÚN TU BD
    if (estadoEmpleados === "activos") {
      filtered = filtered.filter((e) => e.Status === 0);
    } else if (estadoEmpleados === "inactivos") {
      filtered = filtered.filter((e) => e.Status === 1);
    }

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
  }, [datos, estadoEmpleados, busqueda, departamento, advancedFilters]);



  const datosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return datosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [datosFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, departamento, advancedFilters.length]);

  const departamentos = useMemo(
    () => Array.from(new Set(datos.map((d) => d["Departamento"]))),
    [datos]
  );

  const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);

  if (!isMounted) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-8 p-8 bg-gray-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 ring-1 ring-gray-50">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Gestión de Empleados
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              {datosFiltrados.length} empleados activos
            </p>
          </div>
        </div>

        {/* Botón de acción principal si fuera necesario, por ahora vacío o placeholder */}
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Búsqueda rápida
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-hover:text-indigo-500" />
              <Input
                placeholder="Buscar por nombre, documento o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="w-full lg:w-72">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Departamento
            </label>
            <Select value={departamento} onValueChange={setDepartamento}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl">
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                <SelectItem value="all" className="font-medium text-gray-600">Todos</SelectItem>
                {departamentos.map((d) => (
                  <SelectItem key={d} value={d}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      {d}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => setOpenAdvanced(true)}
            className="h-11 px-6 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all duration-200 font-medium"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Tabla
            columnas={columnas}
            datos={datosPaginados}
            onRowClick={async (empleado) => {
              try {
                const res = await fetch(`/api/empleados/${empleado.Oid}`);

                if (!res.ok) {
                  alert("Error cargando datos del empleado");
                  return;
                }

                const dataCompleta = await res.json();

                setSelectedEmpleado(dataCompleta);
                setOpenUpdate(true);
              } catch (err) {
                console.error("Error cargando empleado:", err);
              }
            }}
          />
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={datosFiltrados.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {openUpdate && selectedEmpleado && (
        <UpdateModal
          type={openUpdate ? "empleado" : null}
          data={selectedEmpleado}
          onClose={() => setOpenUpdate(false)}
        />
      )}

      <AdvancedFilterDialog
        open={openAdvanced}
        onOpenChange={setOpenAdvanced}
        onApply={setAdvancedFilters}
      />
    </div>
  );
}
