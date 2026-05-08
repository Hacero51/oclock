'use client';

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import Tabla from "@/components/Table";
import UpdateModal from "@/components/UpdateModal";
import CreateModal from "@/components/CreateModal";
import { Button } from "@/components/ui/Button";
import { FileText, Plus, Download } from "lucide-react";

export default function PermisosIncapacidadesPage() {
  const { estadoEmpleados, refreshTrigger } = useContext(DashboardContext);

  const columnas = ["Empleado", "Tipo", "Inicio", "Fin", "Pago"];

  type PermisoIncapacidad = {
    [key: string]: any;
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
  const [isMounted, setIsMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchPermisos() {
      try {
        const res = await fetch(`/api/permisos-incapacidades?estado=${estadoEmpleados}`);
        if (!res.ok) throw new Error("Error al obtener permisos e incapacidades");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchPermisos();
  }, [isMounted, estadoEmpleados, refreshTrigger]);

  const handleRowClick = (permiso: PermisoIncapacidad) => {
    setSelectedPermiso(permiso);
    setOpenUpdate(true);
  };

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando permisos e incapacidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permisos e Incapacidades</h1>
            <p className="text-sm text-gray-600 mt-1">
              {datos.length} registros encontrados
            </p>
          </div>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabla 
          columnas={columnas} 
          datos={datos} 
          onRowClick={handleRowClick} 
        />
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