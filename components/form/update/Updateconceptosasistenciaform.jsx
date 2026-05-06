"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

export default function ConceptoAsistenciaForm({ data, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Cargar datos del concepto al abrir el modal
  useEffect(() => {
    if (data) {
      reset({
        codigo: data.codigo || '',
        codigoExportar: data.codigoExportar || '',
        nombre: data.nombre || '',
        factor: data.factor || '',
        estado: data.estado || 'Activo'
      });
    }
  }, [data, reset]);

  const onFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = { ...data, ...formData };
      
      if (typeof onUpdate === 'function') {
        await onUpdate(payload);
        onClose();
      } else {
        // Fallback si no se pasa onUpdate (ej: desde UpdateModal)
        const response = await fetch('/api/conceptos-asistencia', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          onClose();
          window.location.reload();
        } else {
          console.error('Error al actualizar concepto');
        }
      }
    } catch (error) {
      console.error('Error actualizando concepto:', error);
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
              Editar Concepto de Asistencia
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
                    value: /^[a-zA-Z0-9.-]+$/,
                    message: "Solo se permiten letras, números, puntos y guiones"
                  }
                })}
                placeholder="Ej: 01, 02.1, 03"
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
                placeholder="Ej: A49, R48, A02"
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
                placeholder="Ej: RECARGO NOCTURNO, HORAS EXTRAS DIURNAS"
                className="w-full"
              />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            {/* Factor */}
            <div className="space-y-2">
              <Label htmlFor="factor" className="text-sm font-medium">
                Factor/Fecha Proga <span className="text-red-500">*</span>
              </Label>
              <Input
                id="factor"
                {...register("factor", { 
                  required: "Este campo es requerido",
                  pattern: {
                    value: /^[0-9,]+$/,
                    message: "Solo se permiten números y comas"
                  }
                })}
                placeholder="Ej: 1,35, 0,, 2,"
                className="w-full"
              />
              {errors.factor && (
                <p className="text-xs text-red-500">{errors.factor.message}</p>
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
            {loading ? 'Guardando...' : 'Actualizar Concepto'}
          </Button>
        </div>
      </form>
    </div>
  );
}