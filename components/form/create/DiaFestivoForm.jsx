"use client";

import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { 
  Calendar,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function DiaFestivoForm({ onClose }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      nombre: "",
      fecha: "",
      estado: "activo"
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log("Creando día festivo:", data);
      if (onClose) onClose();
      alert("Día festivo creado exitosamente");
    } catch (error) {
      console.error("Error creando día festivo:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans">
      
      {/* Header Premium */}
      <div className="bg-[#1e40af] px-6 py-5 flex items-center justify-between border-b border-blue-800/20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Nuevo Día Festivo</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 custom-scrollbar">
        
        {/* Banner Informativo */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-900 text-sm">Nota Importante</p>
            <p className="text-blue-700/80 text-xs leading-relaxed">
              Los días festivos registrados impactan directamente en el cálculo de horas extras y recargos. Asegúrese de que la fecha sea correcta antes de confirmar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            
            {/* Campo: Nombre (Ancho Completo) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1">
                Nombre del Día Festivo <span className="text-red-500">*</span>
              </label>
              <Input
                id="nombre"
                {...register("nombre", { required: "El nombre es obligatorio" })}
                placeholder="Ej: Año Nuevo, Día de la Independencia"
                className={`h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all text-sm font-medium ${errors.nombre ? 'border-red-500' : ''}`}
              />
              {errors.nombre && (
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1 animate-in fade-in duration-300">
                  <X className="w-3 h-3" /> {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Fila: Fecha y Estado (50/50) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1">
                  Fecha Festiva <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fecha"
                  type="date"
                  {...register("fecha", { required: "La fecha es obligatoria" })}
                  className={`h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all text-sm font-medium ${errors.fecha ? 'border-red-500' : ''}`}
                />
                {errors.fecha && (
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1 animate-in fade-in duration-300">
                    <X className="w-3 h-3" /> {errors.fecha.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1">
                  Estado Operativo
                </label>
                <Select defaultValue="activo" onValueChange={(v) => setValue("estado", v)}>
                  <SelectTrigger className="h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 text-sm font-bold uppercase tracking-tight">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-700">Activo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactivo">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-gray-500">Inactivo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* Footer Estilizado */}
      <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 h-12 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 h-12 font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-3"
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirmar Día Festivo
        </Button>
      </div>
    </div>
  );
}