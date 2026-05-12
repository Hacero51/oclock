'use client';

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import Tabla from "@/components/Table";
import UpdateModal from "@/components/UpdateModal";
import CreateModal from "@/components/CreateModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { FileText, Plus, Search, Calendar, Filter } from "lucide-react";

export default function PermisosIncapacidadesPage() {
  const { estadoEmpleados, refreshTrigger } = useContext(DashboardContext);

  const columnas = ["Empleado", "Tipo", "Inicio", "Fin", "Pago"];

  type PermisoIncapacidad = {
    [key: string]: any;
    id: string;
    "Empleado": string;
    "Tipo": string;
    "Inicio": string;
    "Fin": string;
    "Pago": boolean;
  };

  const [selectedPermiso, setSelectedPermiso] = useState<PermisoIncapacidad | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [datos, setDatos] = useState<PermisoIncapacidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Estados para Filtros y Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const itemsPerPage = 15;

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    
    const delayDebounceFn = setTimeout(() => {
      fetchPermisos(currentPage);
    }, 300); // Debounce para no saturar con el buscador

    return () => clearTimeout(delayDebounceFn);
  }, [isMounted, estadoEmpleados, refreshTrigger, currentPage, searchTerm, startDate, endDate]);

  async function fetchPermisos(page: number) {
    setLoading(true);
    try {
      let url = `/api/permisos-incapacidades?estado=${estadoEmpleados}&page=${page}&limit=${itemsPerPage}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al obtener permisos e incapacidades");
      const result = await res.json();
      
      setDatos(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRowClick = (permiso: PermisoIncapacidad) => {
    setSelectedPermiso(permiso);
    setOpenUpdate(true);
  };

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, estadoEmpleados]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-500">
           Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permisos e Incapacidades</h1>
            <p className="text-sm text-gray-600 mt-1">
              {totalItems} registros en total
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
           {/* Buscador */}
           <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nombre de empleado..." 
                className="pl-9 bg-white border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           {/* Filtros de Fecha */}
           <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input 
                  type="date" 
                  className="text-sm bg-transparent border-none focus:ring-0 p-1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-2">
                <input 
                  type="date" 
                  className="text-sm bg-transparent border-none focus:ring-0 p-1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
           </div>

           <Button onClick={() => setOpenCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Registro
          </Button>
        </div>
      </div>

      {/* Contenido Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-20 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Cargando datos...
           </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <Tabla 
                columnas={columnas} 
                datos={datos} 
                onRowClick={handleRowClick} 
              />
            </div>
            
            {/* Paginación */}
            <div className="border-t border-gray-100 bg-gray-50/50">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {openUpdate && selectedPermiso && (
        <UpdateModal
          type="permisoseinca"
          data={selectedPermiso}
          onClose={() => setOpenUpdate(false)}
        />
      )}

      {/* Create Modal */}
      {openCreate && (
        <CreateModal
          type="Permisos E Incapacidades"
          onClose={() => setOpenCreate(false)}
        />
      )}
    </div>
  );
}