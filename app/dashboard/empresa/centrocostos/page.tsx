"use client";

import { useState, useEffect, useMemo } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { NotebookTabs, Search } from "lucide-react";

// ---------------- INTERFACES ---------------- //

type CentroCosto = {
  Oid: string;
  Codigo: string;
  Nombre: string;
};



// ---------------- COMPONENTE PRINCIPAL ---------------- //

export default function CentroCostosPage() {
  const columnas = ["Codigo", "Nombre"];

  // Estados principales
  const [selectedCentroCostos, setSelectedCentroCostos] = useState<CentroCosto | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [datos, setDatos] = useState<CentroCosto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Estados para filtros (si los necesitas después)
  const [busqueda, setBusqueda] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    // ESCUCHAR EVENTO PARA REFRESCAR
    const handleRefreshEvent = () => {
      console.log("Evento recibido: refreshCentroCostosList - Refrescando datos...");
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('refreshCentroCostosList', handleRefreshEvent);

    return () => {
      window.removeEventListener('refreshCentroCostosList', handleRefreshEvent);
    };
  }, []);

  // Fetch de datos
  useEffect(() => {
    if (!isMounted) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching data from /api/centrocostos... refreshKey:", refreshKey);
        const res = await fetch(`/api/centrocostos?t=${Date.now()}`);

        console.log("Response status:", res.status);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setDatos(data || []);


      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
        console.log("Loading finished");
      }
    }

    fetchData();
  }, [isMounted, refreshKey]);


  const datosFiltrados = useMemo(() => {
    if (!busqueda) return datos;

    const texto = busqueda.toLowerCase();
    return datos.filter(
      (item) =>
        item.Codigo?.toLowerCase().includes(texto) ||
        item.Nombre?.toLowerCase().includes(texto)
    );
  }, [datos, busqueda]);

  // Lógica de paginación
  const datosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return datosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [datosFiltrados, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);

  const handleRowClick = (centrocostos: CentroCosto) => {
    setSelectedCentroCostos(centrocostos);
    setOpenUpdate(true);
  };

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleCloseModal = () => {
    setOpenUpdate(false);
    setSelectedCentroCostos(null);
    setRefreshKey((prev) => prev + 1);
  };

  // Estados de carga y error
  if (!isMounted || loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Cargando centros de costo...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">⚠️ Error: {error}</div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl shadow-lg p-6 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
              <NotebookTabs className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Centro de Costos</h1>
              <p className="text-blue-100 text-lg font-medium opacity-90 max-w-xl">
                Puntos de Gestion Operativa y Financiera
              </p>
            </div>
          </div>
        </div>


        <div className="w-full sm:w-auto space-y-6">
          <div className="bg-white-500 rounded-2xl shadow-sm border border-blue-200 p-6 transition-all duration-300 hover:shadow-md">
            <label className="text-xs font-semibold text-black-100 uppercase tracking-wider mb-2 block">
              Búsqueda rápida
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-blue-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tabla y Paginación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Tabla
                columnas={columnas}
                datos={datosPaginados}
                onRowClick={handleRowClick}
              />
            </div>

            {/* Controles de paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={datosFiltrados.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              label="centros de costo"
            />
          </div>
        </div>

        {/* Update Modal */}
        {
          openUpdate && selectedCentroCostos && (
            <UpdateModal
              type="Centro de Costo"
              data={selectedCentroCostos}
              onClose={handleCloseModal}
            />
          )
        }
      </div>
    </div >
  );
}