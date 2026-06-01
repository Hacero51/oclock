"use client";

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import Tabla from "../../../../components/Table";
import CreateModal from "@/components/CreateModal";
import UpdateModal from "@/components/UpdateModal";
import { CalendarSync, Plus, Calendar, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

export default function TurnosPage() {
  const { refreshTrigger } = useContext(DashboardContext);
  const columnas = ["Nombre", "Estado"];

  type Turnos = {
    [key: string]: any;
    "Nombre": string;
    "Estado": string;
  };

  const [selectedTurnos, setSelectedTurnos] = useState<Turnos | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [datos, setDatos] = useState<Turnos[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchTurnos() {
      try {
        const res = await fetch("/api/turnos");
        if (!res.ok) throw new Error("Error al obtener turnos");
        const data = await res.json();
        const turnosConId = data.map((t: any) => ({
          ...t,
          id: t.Oid
        }));
        setDatos(turnosConId);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchTurnos();
  }, [isMounted, refreshTrigger, refreshKey]);

  const handleRowClick = (turnos: Turnos) => {
    setSelectedRowId(turnos.Oid);
    setSelectedTurnos(turnos);
    setOpenUpdate(true);
  };

  const handleDeleteTurno = async (oid: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este turno? Esta acción no se puede deshacer y desvinculará a los empleados asignados.")) {
      return;
    }

    try {
      const res = await fetch(`/api/turnos/${oid}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSelectedRowId(null);
        setRefreshKey(prev => prev + 1); // Refrescar la lista de turnos
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el turno");
      }
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      alert("Error de conexión al eliminar el turno");
    }
  };

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <CalendarSync className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-grey-700/50 font-sans">
      <div className="max-w mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl shadow-lg p-6 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Turnos</h1>
              <p className="text-blue-100 text-lg font-medium opacity-90 max-w-xl">
                Gestión de Organizacional de turnos.
              </p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <Tabla
            columnas={columnas}
            datos={datos}
            selectedRowId={selectedRowId}
            onRowClick={handleRowClick}
            onRowRightClick={(fila: any) => setSelectedRowId(fila.id)}
            renderContextMenu={(fila: any) => {
              return (
                <>
                  <ContextMenuItem onClick={() => {
                    setSelectedTurnos(fila);
                    setOpenUpdate(true);
                  }}>
                    <ExternalLink className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Abrir el objeto</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => setRefreshKey(prev => prev + 1)}>
                    <RefreshCw className="mr-2 h-4 w-4 text-green-600" />
                    <span>Actualizar</span>
                    <ContextMenuShortcut>F5</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => { if (fila.id) handleDeleteTurno(fila.id); }}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                    <span>Suprimir</span>
                    <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
                  </ContextMenuItem>
                </>
              );
            }}
          />
        </div>
      </div>
      {/* Update Modal */}
      {openUpdate && selectedTurnos && (
        <UpdateModal
          type="turno"
          data={selectedTurnos}
          onClose={() => setOpenUpdate(false)}
        />
      )}
    </div>
  );
}