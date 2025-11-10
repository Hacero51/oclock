"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {Textarea} from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SucursalForm() {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    empresa: "",
    tercero: "",
    correo: "",
    descripcion: ""
  });

  const empresas = [
    "Inversiones Reinoso & Cía Ltda",
  ];

  const terceros = [
    "INR",
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto"> 
        
        {/* Header */}
        <div className="mb-8">
          <p className="text-lg text-gray-600">Gestión de Sucursales</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          
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

            {/* Empresa y Tercero en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Correo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <Textarea
                  placeholder="Descripción de la sucursal"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className="w-full"
                />
              </div>
              </div>

          </div>

          {/* Botones - Centrados y con mejor espaciado */}
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

        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Complete los campos obligatorios marcados con *</p>
        </div>

      </div>
      );
}