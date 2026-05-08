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
import { Pagination } from "@/components/ui/Pagination";
import { useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";

// ---------------- INTERFACES ---------------- //

interface EmpleadoAPI {
  ReaderNumber?: string;
  "Número Lector"?: string;
  AcNumber?: string;
  Oid: string;
  Document?: string;
  DocumentNumber?: string;
  Documento?: string;
  DisplayName?: string;
  FullName?: string;
  "Nombre a mostrar"?: string;
  DepartmentName?: string;
  Department?: string;
  Departamento?: string;
  CurrentShiftName?: string;
  CurrentShift?: string;
  "Turno Actual"?: string;
  ValorHora?: string | number;
  "Valor Hora"?: string | number;
  Status?: number;
  StatusId?: number;
}

interface EmpleadoNormalizado {
  "Número Lector": string;
  Oid: string;
  Documento: string;
  "Nombre a mostrar": string;
  Departamento: string;
  "Turno Actual": string;
  "Valor Hora": string | number;
  Status: number | null;
  [key: string]: string | number | null;
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
  const { estadoEmpleados, refreshTrigger } = useContext(DashboardContext);
  const [datos, setDatos] = useState<EmpleadoNormalizado[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchData() {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          status: estadoEmpleados || "todos"
        });

        if (busqueda) queryParams.set("query", busqueda);
        if (departamento && departamento !== "all" && departamento !== "none") {
            // Nota: El filtro de departamento sigue siendo un reto si no se hace en DB.
            // Por ahora, el query del backend busca en eperson (Nombre/Doc).
        }

        const res = await fetch(`/api/empleados?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Error al obtener empleados");

        const json = await res.json();
        const data: EmpleadoAPI[] = json.data || [];
        const pagination = json.pagination || { total: 0, totalPages: 1 };

        // Normaliza los nombres
        const normalizados = data.map((e) => ({
          "Número Lector": String(e.ReaderNumber ?? e["Número Lector"] ?? e.AcNumber ?? ""),
          Oid: e.Oid,
          Documento: String(e.Document ?? e.DocumentNumber ?? e["Documento"] ?? ""),
          "Nombre a mostrar": e.DisplayName ?? e.FullName ?? e["Nombre a mostrar"] ?? "",
          Departamento: e.DepartmentName ?? e.Department ?? e["Departamento"] ?? "",
          "Turno Actual": e.CurrentShiftName ?? e.CurrentShift ?? e["Turno Actual"] ?? "",
          "Valor Hora": e.ValorHora ?? e["Valor Hora"] ?? "",
          Status: typeof e.Status !== "undefined" ? e.Status : (e.StatusId ?? null),
        }));

        setDatos(normalizados);
        setTotalItems(pagination.total);
        setTotalPages(pagination.totalPages);
      } catch (err) {
        console.error("Error cargando empleados:", err);
      }
    }

    fetchData();
  }, [isMounted, refreshKey, refreshTrigger, currentPage, itemsPerPage, busqueda, estadoEmpleados]);

  // Departamentos (Para el filtro, idealmente vendrían de otra API)
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/departamentos')
      .then(res => res.json())
      .then(data => {
        const uniqueDepts = Array.from(new Set(data.map((d: any) => d.name).filter(Boolean))) as string[];
        setDepartamentos(uniqueDepts.sort());
      })
      .catch(err => console.error("Error loading depts:", err));
  }, []);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // El renderizado usa directamente 'datos' ya que vienen filtrados del server
  const datosPaginados = datos;

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, departamento, estadoEmpleados]);

  const totalPags = totalPages;

  if (!isMounted) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-8 p-6 sm:p-8 bg-gray-50/30 min-h-screen font-sans max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 ring-4 ring-gray-50/50">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Gestión de Empleados
            </h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-gray-600">
                {totalItems} empleados
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 font-normal">
                Administración de personal
              </span>
            </p>
          </div>
        </div>

        {/* Botón de acción principal si fuera necesario, por ahora vacío o placeholder */}
      </div>

      {/* FILTROS */}
      <div className="bg-blue-500 rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-2 block">
              Búsqueda rápida
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-hover:text-indigo-500" />
              <Input
                placeholder="Buscar por nombre, documento, número lector o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="w-full lg:w-72">
            <label className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-2 block">
              Departamento
            </label>
            <Select value={departamento} onValueChange={setDepartamento}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl">
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                <SelectItem value="all" className="font-medium text-gray-600">Todos</SelectItem>
                <SelectItem value="none" className="font-medium text-amber-600 italic">
                    Sin asignar
                </SelectItem>
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

        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Tabla
            columnas={columnas}
            datos={datosPaginados}
            onRowClick={async (empleado: EmpleadoNormalizado) => {
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          label="empleados"
        />
      </div>

      {openUpdate && selectedEmpleado && (
        <UpdateModal
          type={openUpdate ? "Empleado" : null}
          data={selectedEmpleado}
          onClose={() => {
            setOpenUpdate(false);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}

    </div>
  );
}
