"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TurnosForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    rotacion: "",
    festivos: "",
    numeroCiclos: "",
    estado: "",
    tiempoExtra: {
      antesEntrada: false,
      despuesSalida: false,
      enComida: false,
      enFestivo: false
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTiempoExtraChange = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tiempoExtra: {
        ...prev.tiempoExtra,
        [tipo]: !prev.tiempoExtra[tipo]
      }
    }));
  };

  const handleGuardar = () => {
    if (!formData.nombre) {
      alert("Por favor complete el campo obligatorio: Nombre");
      return;
    }

    console.log("Datos del turno:", formData);
    alert("Turno guardado exitosamente");
    handleLimpiar();
  };

  const handleLimpiar = () => {
    setFormData({
      nombre: "",
      rotacion: "",
      festivos: "",
      numeroCiclos: "",
      estado: "",
      tiempoExtra: {
        antesEntrada: false,
        despuesSalida: false,
        enComida: false,
        enFestivo: false
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          
          <div className="space-y-6">
            
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <Input
                placeholder="Nombre del turno"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Información del Turno */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Turno</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Rotación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotación
                  </label>
                  <Select 
                    value={formData.rotacion} 
                    onValueChange={(value) => handleInputChange("rotacion", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar rotación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Semana</SelectItem>
                      <SelectItem value="quincena">Quincena</SelectItem>
                      <SelectItem value="mes">Mes</SelectItem>
                      <SelectItem value="personalizada">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Festivos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Festivos
                  </label>
                  <Select 
                    value={formData.festivos} 
                    onValueChange={(value) => handleInputChange("festivos", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_trabaja">No trabaja días de fiesta</SelectItem>
                      <SelectItem value="trabaja_normal">Trabaja normal</SelectItem>
                      <SelectItem value="horario_especial">Horario especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de Ciclos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Ciclos
                  </label>
                  <Input
                    type="number"
                    placeholder="Ej: 4"
                    value={formData.numeroCiclos}
                    onChange={(e) => handleInputChange("numeroCiclos", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <Select 
                    value={formData.estado} 
                    onValueChange={(value) => handleInputChange("estado", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            {/* Tiempo Extra */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tiempo Extra</h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Adicionar Tiempo Extra:
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Tiempo Extra Antes de la Entrada */}
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiempoExtra.antesEntrada}
                      onChange={() => handleTiempoExtraChange("antesEntrada")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Tiempo Extra Antes de la Entrada</span>
                  </label>

                  {/* Tiempo Extra Después de la Salida */}
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiempoExtra.despuesSalida}
                      onChange={() => handleTiempoExtraChange("despuesSalida")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Tiempo Extra Después de la Salida</span>
                  </label>

                  {/* Tiempo Extra en la Comida */}
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiempoExtra.enComida}
                      onChange={() => handleTiempoExtraChange("enComida")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Tiempo Extra en la Comida</span>
                  </label>

                  {/* Tiempo Extra en Festivo */}
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiempoExtra.enFestivo}
                      onChange={() => handleTiempoExtraChange("enFestivo")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Tiempo Extra en Festivo</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-8 pt-6 border-t justify-center">
            <Button 
              onClick={handleGuardar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              Guardar Turno
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

      </div>
    </div>
  );
}