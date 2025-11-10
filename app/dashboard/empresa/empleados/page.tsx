"use client";

import { useState, useEffect, useMemo } from "react";
import Tabla from "../../../../components/Table";
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
import  UpdateEmpleadoForm  from "@/components/form/update/UpdateEmpleadoForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type TablaProps = {
  columnas: any;
  datos: any;
  onRowClick?: (row: any) => void;
};

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

  const [datos, setDatos] = useState<Empleado[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Filtros básicos
  const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Filtros avanzados
  type AdvancedFilter = {
    field: string;
    operator: string;
    value: string;
    connector?: string;
  };
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);

  const handleApplyAdvancedFilters = (filters: AdvancedFilter[]) => {
    setAdvancedFilters(filters);
    setOpenAdvanced(false);
  };

  // Filtrado de datos
  const datosFiltrados = useMemo(() => {
    let filtered = datos;
    if (busqueda) {
      const texto = busqueda.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item["Nombre a mostrar"].toLowerCase().includes(texto) ||
          item["Documento"].includes(busqueda)
      );
    }
    if (departamento && departamento !== "all") {
      filtered = filtered.filter(
        (item) => item["Departamento"] === departamento
      );
    }
    if (advancedFilters.length > 0) {
      filtered = filtered.filter((empleado) =>
        advancedFilters.every((filter) => {
          const { field, operator, value, connector } = filter;
          if (!value) return true;
          const empleadoValue = empleado[field]?.toString().toLowerCase() || "";
          const filterValue = value.toLowerCase();
          let conditionMet = false;
          switch (operator) {
            case "igual":
              conditionMet = empleadoValue === filterValue;
              break;
            case "contiene":
              conditionMet = empleadoValue.includes(filterValue);
              break;
            case "empieza":
              conditionMet = empleadoValue.startsWith(filterValue);
              break;
            case "termina":
              conditionMet = empleadoValue.endsWith(filterValue);
              break;
            default:
              conditionMet = true;
          }
          if (connector === "No" || connector === "O no") return !conditionMet;
          return conditionMet;
        })
      );
    }
    return filtered;
  }, [busqueda, departamento, fechaInicio, fechaFin, datos, advancedFilters]);

  const departamentos = useMemo(
    () => Array.from(new Set(datos.map((d) => d["Departamento"]))),
    [datos]
  );

  const handleClearAllFilters = () => {
    setBusqueda("");
    setDepartamento("");
    setFechaInicio("");
    setFechaFin("");
    setAdvancedFilters([]);
  };

  const handleRowClick = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setOpenModal(true);
  };

  if (!isMounted) {
    return (
      <div className="p-8 text-center text-gray-500">Cargando empleados...</div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📋 Empleados</h1>
        <div className="flex gap-2">
          {(busqueda || departamento || advancedFilters.length > 0) && (
            <Button
              variant="outline"
              onClick={handleClearAllFilters}
              className="text-gray-600 border-gray-300"
            >
              Limpiar Filtros
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpenAdvanced(true)}
            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            ⚙️ Filtros Avanzados
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
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
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departamentos.map((dep) => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <Tabla columnas={columnas} datos={datosFiltrados} onRowClick={handleRowClick} />

      {/* Modal de Update */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          {selectedEmpleado && (
            <UpdateEmpleadoForm
              empleado={selectedEmpleado}
              onClose={() => setOpenModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Filtros Avanzados */}
      <AdvancedFilterDialog
        open={openAdvanced}
        onOpenChange={setOpenAdvanced}
        onApply={handleApplyAdvancedFilters}
      />
    </div>
  );
}
