"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

export default function TipoPermisoForm({ data, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const pagoValue = watch("pago");

  // Cargar datos del permiso al abrir el modal
  useEffect(() => {
    if (data) {
      reset({
        codigo: data.codigo || '',
        codigoExportar: data.codigoExportar || '',
        nombre: data.nombre || '',
        pago: data.pago !== undefined ? data.pago : true,
        estado: data.estado || 'Activo'
      });
    }
  }, [data, reset]);

  const onFormSubmit = async (formData) => {
    setLoading(true);
    try {
      await onUpdate({
        ...data,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error('Error actualizando permiso:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              Editar Tipo de Permiso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                {...register("codigo", { 
                  required: "Este campo es requerido",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Solo se permiten números"
                  }
                })}
                placeholder="Ej: 001, 002, 003"
                className="w-full"
              />
              {errors.codigo && (
                <p className="text-xs text-red-500">{errors.codigo.message}</p>
              )}
            </div>

            {/* Código Exportar */}
            <div className="space-y-2">
              <Label htmlFor="codigoExportar" className="text-sm font-medium">
                Código Exportar
              </Label>
              <Input
                id="codigoExportar"
                {...register("codigoExportar")}
                placeholder="Ej: A13, A12, A09"
                className="w-full"
              />
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                {...register("nombre", { required: "Este campo es requerido" })}
                placeholder="Ej: CITA MEDICA ARL, PERMISO PERSONAL, VACACIONES"
                className="w-full"
              />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            {/* Pago */}
            <div className="space-y-2">
              <Label htmlFor="pago" className="text-sm font-medium">
                Tipo de Pago <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="true"
                    {...register("pago", { required: "Este campo es requerido" })}
                    className="text-blue-600 focus:ring-blue-300"
                  />
                  <span className={`px-3 py-1 rounded text-sm ${
                    pagoValue === true ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Con Pago
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="false"
                    {...register("pago", { required: "Este campo es requerido" })}
                    className="text-blue-600 focus:ring-blue-300"
                  />
                  <span className={`px-3 py-1 rounded text-sm ${
                    pagoValue === false ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Sin Pago
                  </span>
                </label>
              </div>
              {errors.pago && (
                <p className="text-xs text-red-500">{errors.pago.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-sm font-medium">
                Estado <span className="text-red-500">*</span>
              </Label>
              <select
                {...register("estado", { required: "Este campo es requerido" })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="text-xs text-red-500">{errors.estado.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 py-2"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Actualizar Permiso'}
          </Button>
        </div>
      </form>
    </div>
  );
}