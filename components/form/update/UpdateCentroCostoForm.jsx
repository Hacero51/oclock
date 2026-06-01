"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Building,
  Save,
  X,
  Loader2,
} from "lucide-react";


import Tabla from "@/components/Table";
import { Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UpdateEmpleadoForm from "@/components/form/update/UpdateEmpleadoForm";
import { Pagination } from "@/components/ui/Pagination";

export default function CentroCostoForm({ data, onClose }) {
  const [form, setForm] = useState({
    Oid: "",
    codigo: "",
    nombre: "",
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false); // Nuevo estado para carga de empleados
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Nested Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Contexto para filtro
  const { estadoEmpleados } = useContext(DashboardContext);

  // Paginación de empleados
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // CARGAR DATOS
  useEffect(() => {
    if (data) {
      setForm({
        Oid: data.Oid,
        codigo: data.Codigo || data.codigo || "",
        nombre: data.Nombre || data.nombre || "",
      });
      fetchEmployees(data.Oid);
    }
  }, [data]);

  const fetchEmployees = async (oid) => {
    setLoadingEmployees(true);
    try {
      const res = await fetch(`/api/centrocostos/${oid}`);
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.empleados) {
          setEmployees(responseData.empleados);
        }
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // MANEJO DEL FORMULARIO
  const handleChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN: Nombre solo letras y espacios
    if (name === "nombre") {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
      if (!regex.test(value)) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (form.codigo && form.codigo.length > 20) {
      newErrors.codigo = "El código no puede tener más de 20 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ENVIAR UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    setErrors({});

    try {
      const res = await fetch(`/api/centrocostos/${form.Oid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Error actualizando centro de costo");
      }

      const event = new CustomEvent('showToast', {
        detail: {
          message: '✅ Centro de costo actualizado con éxito',
          type: 'success'
        }
      });
      window.dispatchEvent(event);

      // Disparar evento de refresco
      const refreshEvent = new CustomEvent('refreshCentroCostosList');
      window.dispatchEvent(refreshEvent);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: `❌ ${error.message}`,
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setSaveLoading(false);
    }
  };

  // Manejar click en empleado
  const handleRowClick = async (employeeRow) => {
    try {
      // Necesitamos el Oid para buscar el empleado completo.
      const oid = employeeRow.Oid;
      if (!oid) return;

      const res = await fetch(`/api/empleados/${oid}`);
      if (!res.ok) throw new Error("Error cargando empleado");

      const fullEmployee = await res.json();
      setSelectedEmployee(fullEmployee);
      setIsEmployeeModalOpen(true);
    } catch (error) {
      console.error("Error opening employee modal:", error);
      const event = new CustomEvent('showToast', {
        detail: { message: '❌ Error cargando detalles del empleado', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  // Refresh después de editar empleado (opcional, si queremos actualizar la lista)
  const handleEmployeeUpdated = () => {
    setIsEmployeeModalOpen(false);
    fetchEmployees(form.Oid); // Recargar la lista
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-4">
        <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500 font-medium">Cargando información...</p>
      </div>
    );
  }

  // Filtrar empleados según el contexto
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (estadoEmpleados === "activos") {
      filtered = filtered.filter((e) => e.Status === 0);
    } else if (estadoEmpleados === "inactivos") {
      filtered = filtered.filter((e) => e.Status === 1);
    }

    return filtered;
  }, [employees, estadoEmpleados]);

  // Calcular datos paginados sobre filteredEmployees
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Columnas para la tabla de empleados
  const employeeColumns = [
    "Documento",
    "Nombre a mostrar",
    "Cargo",
    "Departamento",
    "Contrato",
    "Jefe",
    "Turno Actual",
    "Valor Hora"
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <Card>
          <CardHeader className="pb-4 bg-blue-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building className="w-5 h-5" />
              </div>
              Información del Centro de Costo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6 max-w-2xl">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-sm font-medium flex items-center gap-1">
                  Código
                </Label>
                <Input
                  name="codigo"
                  alphanumeric
                  uppercase
                  noSpaces
                  value={form.codigo}
                  onChange={handleChange}
                  className="w-full py-3 px-4"
                  disabled={saveLoading}
                />
                {errors.codigo && (
                  <p className="text-sm text-red-600">{errors.codigo}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="nombre"
                  onlyLetters
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full text-lg py-3 px-4"
                  disabled={saveLoading}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Sección de Empleados */}
        <Card className="mt-6">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Empleados Asociados ({employees.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingEmployees ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="rounded-md border-t border-gray-100">
                  <Tabla
                    columnas={employeeColumns}
                    datos={currentEmployees}
                    onRowClick={handleRowClick}
                  />
                </div>
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredEmployees.length}
                    itemsPerPage={pageSize}
                    onPageChange={handlePageChange}
                    label="empleados"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* FOOTER ACCIONES */}

        {/* FOOTER ACCIONES */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saveLoading}
            className="sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saveLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto"
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                <span className="truncate">Guardando...</span>
              </>
            ) : (
              <>
                <Save className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">Guardar Cambios</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* MODAL EMPLEADO */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen} size="6xl" zIndex={10000}>
        {selectedEmployee && (
          <DialogContent className="max-h-[95vh] h-[95vh] overflow-hidden p-0 rounded-xl flex flex-col bg-gray-50">
            <div className="h-full overflow-y-auto pb-12">
              <UpdateEmpleadoForm
                data={selectedEmployee}
                onClose={() => setIsEmployeeModalOpen(false)}
                refreshData={handleEmployeeUpdated}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}