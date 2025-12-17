"use client";

import { useState, useEffect, useMemo } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { AlignCenterVertical, FileText, ChevronLeft, ChevronRight, Users } from "lucide-react";

// ---------------- INTERFACES ---------------- //

type CentroCosto = {
  Oid: string;
  Codigo: string;
  Nombre: string;
};

// ---------------- COMPONENTE DE PAGINACIÓN ---------------- //

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
  onItemsPerPageChange,
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          No hay centros de costo para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-400" />
        Mostrando <span className="text-gray-900 font-bold">{startItem}-{endItem}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> centros de costo
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all duration-200 shadow-sm"
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
                className={`w-9 h-9 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${currentPage === pageNum
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600 border border-transparent hover:border-gray-200"
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
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all duration-200 shadow-sm"
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
          <option value={8}>8</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
        </select>
      </div>
    </div>
  );
}

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <AlignCenterVertical className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centros de Costos</h1>
            <p className="text-sm text-gray-600 mt-1">
              {datosFiltrados.length} centros de costo registrados
            </p>
          </div>
        </div>

        {/* Botón de búsqueda si quieres agregarlo */}
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-blue-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Tabla
            columnas={columnas}
            datos={datosPaginados}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Controles de paginación */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={datosFiltrados.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Update Modal */}
      {openUpdate && selectedCentroCostos && (
        <UpdateModal
          type="Centro de Costo"
          data={selectedCentroCostos}
          onClose={() => setOpenUpdate(false)}
        />
      )}
    </div>
  );
}