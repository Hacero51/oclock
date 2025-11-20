"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Componente de tabla simple
function EmpleadosTable({ empleados }) {
  const columnas = [
    "Documento",
    "Nombre a mostrar", 
    "Cargo",
    "Departamento",
    "Contrato Actual",
    "Jefe",
    "Turno Actual",
    "Valor Hora"
  ];

  if (!empleados || empleados.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay empleados asignados a esta sucursal
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {empleados.map((empleado, index) => (
            <tr key={empleado.documento || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.documento}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.cargo || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.departamento}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.contrato || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.jefe || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.turno}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {empleado.valorHora}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente de paginación local
function PaginationControls({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} empleados
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600 mx-2">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
          Empleados por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

export default function SucursalForm() {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    empresa: "",
    tercero: "",
    correo: "",
    descripcion: ""
  });

  // Estado para empleados
  const [empleados, setEmpleados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const empresas = [
    "Inversiones Reinoso & Cía Ltda",
  ];

  const terceros = [
    "INR",
  ];

  // Simular carga de empleados
  useEffect(() => {
    const timer = setTimeout(() => {
      // Datos de ejemplo basados en la imagen
      const empleadosEjemplo = [
        {
          documento: "58522181",
          nombre: "JOSEFINA PINZON DIAZ",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$3.053,63"
        },
        {
          documento: "52183544",
          nombre: "OMARA EDITH RAMIREZ GONZALEZ",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$3.125,00"
        },
        {
          documento: "79580274",
          nombre: "GUSTAVO ADOLFO ROJAS MORENO",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$3.125,00"
        },
        {
          documento: "8051431",
          nombre: "JOSE ALONSO RAMOS BERRIO",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "OFICINA CALLE 4...",
          valorHora: "$6.620,63"
        },
        {
          documento: "1108232038",
          nombre: "WILMAR TAPIAS REINOSO",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$8.858,33"
        },
        {
          documento: "79500352",
          nombre: "JAIME CALDERON",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$3.120,83"
        },
        {
          documento: "77027249",
          nombre: "RAMON ANTONIO BOLAÑO IZQUIERDO",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$3.677,08"
        },
        {
          documento: "79050136",
          nombre: "MARTIN ALBERTO BERNAL SANTAMARIA",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$6.855,83"
        },
        {
          documento: "79748788",
          nombre: "JHON EMERSON IÑIGO CARDENAS",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$4.904,17"
        },
        {
          documento: "301793",
          nombre: "BAUDILIO LAGUNA NARVAEZ",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$5.127,08"
        },
        {
          documento: "93472191",
          nombre: "JOSE HELMER RAMIREZ VILLA",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$3.125,00"
        },
        {
          documento: "79698370",
          nombre: "JOSE DAVID PUERTAS GUERBERO",
          cargo: "",
          departamento: "EXTRUDADOS/PLANTA",
          contrato: "",
          jefe: "",
          turno: "PLANTA 6 AM - 2 PM",
          valorHora: "$2.929,13"
        }
      ];
      
      setEmpleados(empleadosEjemplo);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Datos paginados
  const empleadosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return empleados.slice(startIndex, startIndex + itemsPerPage);
  }, [empleados, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(empleados.length / itemsPerPage);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuardar = () => {
    if (!formData.codigo || !formData.nombre) {
      alert("Por favor complete los campos obligatorios: Código y Nombre");
      return;
    }

    console.log("Datos de sucursal:", formData);
    alert("Sucursal guardada exitosamente");
    handleLimpiar();
  };

  const handleLimpiar = () => {
    setFormData({
      codigo: "",
      nombre: "",
      empresa: "",
      tercero: "",
      correo: "",
      descripcion: ""
    });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Sucursales</h1>
          <p className="text-lg text-gray-600">Complete la información de la sucursal</p>
        </div>

        {/* Formulario - OCUPA TODO EL ANCHO */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Información de la Sucursal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Sucursal *
                </label>
                <Input
                  placeholder="Código único"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <Select 
                  value={formData.empresa} 
                  onValueChange={(value) => handleInputChange("empresa", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa} value={empresa}>
                        {empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo
                </label>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={formData.correo}
                  onChange={(e) => handleInputChange("correo", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Sucursal *
                </label>
                <Input
                  placeholder="Ej: Sucursal Norte"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Tercero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tercero
                </label>
                <Select 
                  value={formData.tercero} 
                  onValueChange={(value) => handleInputChange("tercero", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tercero" />
                  </SelectTrigger>
                  <SelectContent>
                    {terceros.map((tercero) => (
                      <SelectItem key={tercero} value={tercero}>
                        {tercero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <Textarea
                  placeholder="Descripción de la sucursal"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-8 pt-6 border-t justify-center">
            <Button 
              onClick={handleGuardar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              Guardar Sucursal
            </Button>
            <Button 
              onClick={handleLimpiar}
              variant="outline"
              className="px-6 py-2 border-gray-300"
            >
              Limpiar
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 px-6 py-2"
            >
              Cancelar
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Complete los campos obligatorios marcados con *</p>
          </div>
        </div>

        {/* Tabla de Empleados - DEBAJO DEL FORMULARIO */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Empleados de la Sucursal</h2>
            <span className="text-sm text-gray-500">
              {empleados.length} empleados encontrados
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando empleados...</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <EmpleadosTable empleados={empleadosPaginados} />
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={empleados.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}