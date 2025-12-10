"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Folder,
  Users,
  Search,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  X
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import Tabla from "@/components/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";

import UpdateEmpleadoForm from "@/components/form/update/UpdateEmpleadoForm";

// ... (Tipos Department y Employee iguales)
interface Department {
  id: string;
  name: string;
  parentId: string | null;
  count: number;
  children?: Department[];
}

interface Employee {
  Oid: string;
  "Número Lector": string;
  Documento: string;
  "Nombre a mostrar": string;
  Cargo: string;
  DepartmentId?: string;
}

//Arbol de departamentos
function TreeItem({
  dept,
  level = 0,
  onSelect
}: {
  dept: Department;
  level?: number;
  onSelect: (dept: Department) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = dept.children && dept.children.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center group cursor-pointer py-1.5 transition-colors hover:bg-gray-50 rounded-r-md"
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(dept);
        }}
      >
        <div
          className="mr-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {hasChildren && (
            open ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />
          )}
        </div>

        <Folder
          size={25}
          className={`mr-2 ${hasChildren ? "text-yellow-500 fill-yellow-50" : "text-blue-500 fill-blue-50"} transition-colors`}
        />

        <span className="text-gray-700 text-sm font-medium group-hover:text-indigo-700">
          {dept.name}
        </span>

        {/* Count badge discreto */}
        {dept.count > 0 && (
          <span className="ml-2 text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-1.5 rounded-full font-semibold">
            {dept.count}
          </span>
        )}
      </div>

      {open && hasChildren && (
        <div>
          {dept.children!.map((child) => (
            <TreeItem
              key={child.id}
              dept={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Página Principal
// ----------------------------------------------------------------------
export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [empleados, setEmpleados] = useState<Employee[]>([]);

  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingEmps, setLoadingEmps] = useState(false);

  // Estado para el Modal
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de empleado
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [isEmpleadoModalOpen, setIsEmpleadoModalOpen] = useState(false);

  // Busqueda
  const [busqueda, setBusqueda] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Ajustable según altura de pantalla

  // Cargar departamentos
  useEffect(() => {
    async function fetchDepts() {
      try {
        const res = await fetch("/api/departamentos");
        if (res.ok) {
          const data = await res.json();
          setDepartamentos(data);
        }
      } catch (error) {
        console.error("Error cargando departamentos", error);
      } finally {
        setLoadingDepts(false);
      }
    }
    fetchDepts();
  }, []);

  // Cargar empleados con refreshKey
  useEffect(() => {
    async function fetchAllEmployees() {
      setLoadingEmps(true);
      try {
        const res = await fetch("/api/departamentos/empleados");
        if (res.ok) {
          const data = await res.json();
          setEmpleados(data);
        }
      } catch (error) {
        console.error("Error empleados", error);
      } finally {
        setLoadingEmps(false);
      }
    }
    fetchAllEmployees();
  }, [refreshKey]);

  // Construir árbol jerárquico
  const treeData = useMemo(() => {
    const map = new Map<string, Department>();
    const roots: Department[] = [];
    departamentos.forEach(d => { map.set(d.id, { ...d, children: [] }); });
    departamentos.forEach(d => {
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId)!.children!.push(map.get(d.id)!);
      } else {
        roots.push(map.get(d.id)!);
      }
    });
    // Filtrar raíces vacías (sin hijos y sin conteo)
    return roots.filter(r => (r.children && r.children.length > 0) || r.count > 0);
  }, [departamentos]);

  // Manejar click jerárquico
  const handleSelectDept = (dept: Department) => {
    setSelectedDept(dept);
    setBusqueda("");
    setCurrentPage(1); // Reset paginación
    setIsModalOpen(true);
  };

  // Manejar click en fila de empleado
  const handleEmpleadoRowClick = async (empleado: Employee) => {
    try {
      const res = await fetch(`/api/empleados/${empleado.Oid}`);
      if (!res.ok) {
        console.error("No se pudo cargar el empleado");
        return;
      }

      const fullEmpleado = await res.json();
      setSelectedEmpleado(fullEmpleado);
      setIsEmpleadoModalOpen(true);

    } catch (err) {
      console.error("Error cargando empleado:", err);
    }
  };

  // Función para refrescar los datos después de actualizar un empleado
  const handleEmpleadoUpdated = () => {
    setRefreshKey(prev => prev + 1); // Incrementa refreshKey para re-fetch
    setIsEmpleadoModalOpen(false); // Cierra el modal
  };

  // Filtrar empleados
  const filteredEmployees = useMemo(() => {
    if (!selectedDept) return [];
    const filtered = empleados.filter(e => e.DepartmentId === selectedDept.id);

    if (busqueda) {
      const lower = busqueda.toLowerCase();
      return filtered.filter(e =>
        e["Nombre a mostrar"]?.toLowerCase().includes(lower) ||
        e.Documento?.includes(lower)
      );
    }
    return filtered;
  }, [selectedDept, empleados, busqueda]);

  // Datos Paginados
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Padre Nombre
  const parentName = useMemo(() => {
    if (!selectedDept?.parentId) return "";
    const parent = departamentos.find(d => d.id === selectedDept.parentId);
    return parent ? parent.name : "Desconocido";
  }, [selectedDept, departamentos]);

  const columnasTabla = ["Documento", "Nombre a mostrar", "Cargo", "Contrato Actual", "Jefe", "Turno Actual", "Valor Hora"];

  return (
    <div className="p-6 md:p-8 bg-grey-700/50 font-sans">
      <div className="max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 w-fit">
            <LayoutGrid className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Departamentos</h1>
          </div>
        </div>

        {/* ARBOL */}
        <div className="bg-grey-700/50 rounded-2xl shadow-sm border border-red-200 p-8 min-h-[600px]">
          {loadingDepts ? (
            <div className="flex items-left justify-left h-40 text-black-400 gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black-600"></div>
              Cargando...
            </div>
          ) : (
            <div className="space-y-1">
              {treeData.map(dept => (
                <TreeItem
                  key={dept.id}
                  dept={dept}
                  onSelect={handleSelectDept}
                />
              ))}
              {treeData.length === 0 && (
                <div className="text-gray-400 italic">No se encontraron departamentos.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="5xl" // Tamaño
      >
        {selectedDept && (
          <DialogContent className="max-h-[95vh] h-auto flex flex-col p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl">

            {/* Header Modal */}
            <DialogHeader className="px-6 py-5 border-b border-blue-500 bg-white flex-shrink-0 flex flex-row items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl text-gray-800 font-bold">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Folder className="text-blue-600 fill-blue-100 h-6 w-6" />
                </div>
                {selectedDept.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </Button>
            </DialogHeader>

            {/* Body Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
              <div className="space-y-6">

                {/* Inputs Solo Lectura */}
                <div className="bg-blue-500 p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-white-400 uppercase font-bold tracking-wider">Nombre Departamento</Label>
                    <Input
                      readOnly
                      value={selectedDept.name}
                      className="bg-gray-50 border-gray-200 text-gray-700 font-medium focus-visible:ring-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white-400 uppercase font-bold tracking-wider">Departamento Padre</Label>
                    <Input
                      readOnly
                      value={parentName}
                      className="bg-gray-50 border-gray-200 text-gray-700 font-medium focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Tabla Section */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <Users size={18} className="text-indigo-500" />
                      Empleados ({filteredEmployees.length})
                    </h3>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar empleado..."
                        className="h-10 pl-9 text-sm bg-white border-gray-200 focus:border-indigo-300 transition-all rounded-lg"
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    {loadingEmps ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-10">
                        <div className="animate-spin mb-4 rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <p>Cargando lista de empleados...</p>
                      </div>
                    ) : filteredEmployees.length > 0 ? (
                      <>
                        <div className="flex-1 overflow-x-auto">
                          <Tabla
                            columnas={columnasTabla}
                            datos={paginatedEmployees}
                            onRowClick={handleEmpleadoRowClick}
                          />
                        </div>
                        <div className="border-t border-gray-100 bg-gray-50/50">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredEmployees.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                          <Users size={32} className="opacity-40" />
                        </div>
                        <p className="font-medium">No hay empleados en este departamento</p>
                        <p className="text-sm mt-1 opacity-60">Intenta buscar en sub-departamentos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal empleados */}
      <Dialog open={isEmpleadoModalOpen} onOpenChange={setIsEmpleadoModalOpen} size="4xl">
        {selectedEmpleado && (
          <DialogContent className="max-w-5xl w-full max-h-[95vh] overflow-hidden p-0 rounded-xl">
            <div className="h-full overflow-y-auto px-2 pb-4">
              <UpdateEmpleadoForm
                data={selectedEmpleado}
                onClose={() => setIsEmpleadoModalOpen(false)}
                refreshData={() => setRefreshKey(prev => prev + 1)}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
