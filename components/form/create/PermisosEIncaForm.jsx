"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

// Datos de ejemplo
const empleados = [
  "Juan Pérez",
  "María García", 
  "Carlos López",
  "Ana Martínez",
  "Pedro Rodríguez"
];

const tiposPermiso = [
  "CITA MEDICA ARL",
  "CITA MEDICA GENERAL",
  "CITA MEDICA HIJOS MENOR DE 12 AÑOS",
  "DESCANSO POR DOBLAR TURNO",
  "INCAPACIDAD ARL",
  "INCAPACIDAD ENFERMEDAD GENERAL <=3 (66.67%)",
  "INCAPACIDAD ENFERMEDAD GENERAL >3 (66.67%)",
  "INCAPACIDAD GENERAL HIJOS",
  "INCAPACIDAD MATERNIDAD / PATERNIDAD",
  "PERMISO PERSONAL",
  "PERMISO POR DUELO",
  "SANCION",
  "VACACIONES"
];

export default function PermisosEIncaForm({ onClose }) {
  const [formData, setFormData] = useState({
    empleado: "",
    tipo: "",
    inicio: "",
    fin: "",
    pago: "no",
    nota: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNuevo = () => {
    setFormData({
      empleado: "",
      tipo: "",
      inicio: "",
      fin: "",
      pago: "no",
      nota: ""
    });
  };

  const handleLimpiar = () => {
    setFormData({
      empleado: "",
      tipo: "",
      inicio: "",
      fin: "",
      pago: "no",
      nota: ""
    });
  };

  const handleGuardar = () => {
    if (!formData.empleado || !formData.tipo || !formData.inicio || !formData.fin) {
      alert("Por favor complete los campos obligatorios: Empleado, Tipo, Inicio y Fin");
      return;
    }

    alert("Registro guardado exitosamente");
    handleLimpiar();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto"> {/* ✅ REDUCIDO el ancho máximo */}
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empleados</h1>
          <p className="text-lg text-gray-600">Permisos E Incapacidades</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Solicitud de Permiso</h2>
          
          <div className="space-y-4">
            {/* Empleado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado *
              </label>
              <Select 
                value={formData.empleado} 
                onValueChange={(value) => handleInputChange("empleado", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((emp) => (
                    <SelectItem key={emp} value={emp}>
                      {emp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => handleInputChange("tipo", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposPermiso.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inicio *
                </label>
                <Input
                  type="date"
                  value={formData.inicio}
                  onChange={(e) => handleInputChange("inicio", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fin *
                </label>
                <Input
                  type="date"
                  value={formData.fin}
                  onChange={(e) => handleInputChange("fin", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Pago */}
            <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <input
                type="checkbox"
                id="pago"
                checked={formData.pago === "si"}
                onChange={(e) => handleInputChange("pago", e.target.checked ? "si" : "no")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="pago" className="text-sm font-medium text-gray-700">
                Pago
              </label>
            </div>

            {/* Nota */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota
              </label>
              <Textarea
                placeholder="Observaciones o notas adicionales..."
                value={formData.nota}
                onChange={(e) => handleInputChange("nota", e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button 
              onClick={handleGuardar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Guardar
            </Button>
            <Button 
              onClick={handleNuevo}
              variant="outline"
              className="px-6"
            >
              Nuevo
            </Button>
            <Button 
              onClick={handleLimpiar}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 px-6"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}