"use client";

import { useState, useEffect } from "react";
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { Input } from "@/components/ui/Input.JSX";
import { Button } from "@/components/ui/Button";
import { 
  Building, 
  Search, 
  Plus,
  Download,
  Filter
} from "lucide-react";

export default function SucursalesPage() {
  const columnas = ["Código", "Nombre a mostrar", "Tercero", "Correo"];

  type Sucursal = {
    [key: string]: any;
    "Código": string;
    "Nombre a mostrar": string;
    "Tercero": string;
    "Correo": string;
  };

  // Modal Update
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [datos, setDatos] = useState<Sucursal[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Evitar error de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Obtener datos desde la API
  useEffect(() => {
    if (!isMounted) return;
    async function fetchSucursales() {
      try {
        const res = await fetch("/api/sucursales");
        if (!res.ok) throw new Error("Error al obtener sucursales");
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchSucursales();
  }, [isMounted]);

  // Filtrar datos por búsqueda
  const datosFiltrados = datos.filter(sucursal =>
    sucursal["Nombre a mostrar"]?.toLowerCase().includes(busqueda.toLowerCase()) ||
    sucursal["Código"]?.toLowerCase().includes(busqueda.toLowerCase()) ||
    sucursal["Correo"]?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Al hacer click en fila
  const handleRowClick = (sucursales: Sucursal) => {
    setSelectedSucursal(sucursales);
    setOpenUpdate(true);
  };

  // Evitar render prematuro
  if (!isMounted) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando sucursales...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
            <p className="text-sm text-gray-600 mt-1">
              {datosFiltrados.length} sucursales encontradas
            </p>
          </div>
        </div>
      </div>


      {/* 🔹 Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabla 
          columnas={columnas} 
          datos={datosFiltrados}  
          onRowClick={handleRowClick} 
        />
      </div>

      {/* Update Modal */}
      {openUpdate && selectedSucursal && (
        <UpdateModal
          type="sucursal"
          data={selectedSucursal}
          onClose={() => setOpenUpdate(false)}
        />
      )}
    </div>
  );
}