"use client";

import { useState, useEffect } from "react";
import {
  CalendarClock,
  Search,
  LayoutGrid
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import Tabla from "@/components/Table";
import { Pagination } from "@/components/ui/Pagination";
import UpdateModal from "@/components/UpdateModal";

export default function HorariosPage() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Estados para Modal de Edición
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar Horarios
  useEffect(() => {
    async function fetchHorarios() {
      try {
        const res = await fetch("/api/horarios");
        if (res.ok) {
          const data = await res.json();
          setHorarios(data);
        }
        console.log("Datos recibidos en GET horarios:", res);
      } catch (error) {
        console.error("Error cargando horarios", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHorarios();
  }, [refreshKey]);

  const handleRowClick = (fila: any) => {
    // La fila viene mapeada, pero guardamos 'original'
    console.log("Fila seleccionada:", fila);
    if (fila.original) {
      setSelectedHorario(fila.original);
      setShowUpdateModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setSelectedHorario(null);
    setRefreshKey(prev => prev + 1); // Incrementa refreshKey para refrescar datos
  };

  // Columnas para la Tabla (Deben coincidir con las llaves del objeto mapeado abajo)
  const columnas = ["Nombre a mostrar", "Tiempo Total", "Tipo"];

  // Filtrado y Mapeo de Datos para la Tabla
  const filteredData = horarios
    .filter((h: any) =>
      h.Name?.toLowerCase().includes(busqueda.toLowerCase())
    )
    .map((h: any) => ({
      "Nombre a mostrar": h.DisplayName || h.Name,
      "Tiempo Total": h.TotalTime,
      "Tipo": h.Type,
      // Guardamos el original por si acaso (aunque la tabla solo mostrará lo que esté en columnas)
      original: h
    }));

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 md:p-8 bg-grey-700/50 font-sans">
      <div className="max-w mx-auto">

        {/* Header con Diseño de Tarjeta Azul */}
        <div className="bg-blue-600 rounded-2xl shadow-lg p-6 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
              <CalendarClock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Horarios</h1>
              <p className="text-blue-100 text-lg font-medium opacity-90 max-w-xl">
                Gestión de jornadas laborales y tiempos de trabajo.
              </p>
            </div>
          </div>
        </div>

        {/* Contenedor Principal */}
        <div className="space-y-4">

          {/* Barra de Búsqueda */}
          <div className="flex justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Buscar horario..."
                className="h-10 pl-9 text-sm bg-white border-blue-500 focus:border-indigo-300 transition-all rounded-lg"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-10">
                <div className="animate-spin mb-4 rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p>Cargando horarios...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <>
                <div className="flex-1 overflow-x-auto">
                  <Tabla
                    columnas={columnas}
                    datos={paginatedData}
                    onRowClick={handleRowClick}
                  />
                </div>
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <CalendarClock size={32} className="opacity-40" />
                </div>
                <p className="font-medium">No se encontraron horarios</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de Edición */}
      {showUpdateModal && selectedHorario && (
        <UpdateModal
          type="Horarios"
          data={selectedHorario}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
