"use client";

import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { 
  Briefcase, 
  DollarSign, 
  Code as CodeIcon,
  X,
  CheckCircle2,
  TrendingUp,
  Loader2
} from "lucide-react";

export default function CargoForm({ onClose }) {
  const [saveLoading, setSaveLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      nombre: "",
      codigo: "",
      salarioBase: ""
    }
  });

  const onSubmit = async (data) => {
    setSaveLoading(true);
    try {
      console.log("Creando cargo:", data);
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onClose) onClose();
      // Disparar evento para refrescar si es necesario
      window.dispatchEvent(new CustomEvent('refreshCargosList'));
      
    } catch (error) {
      console.error("Error creando cargo:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans">
      
      {/* Header Premium */}
      <div className="bg-[#1e40af] px-6 py-5 flex items-center justify-between border-b border-blue-800/20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Nuevo Cargo</h2>
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
          <TrendingUp className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-900 text-sm italic">Definición de Perfiles</p>
            <p className="text-blue-700/80 text-xs leading-relaxed">
              Establezca los requisitos y compensación base para este cargo. Esta información es fundamental para la gestión de nómina y roles.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto w-full">
          <div className="space-y-6">
            
            {/* Nombre del Cargo */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1 flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Nombre del Cargo <span className="text-red-500">*</span>
              </label>
              <Input
                id="nombre"
                {...register("nombre", { required: "El nombre es obligatorio" })}
                placeholder="Ej: Gerente de Operaciones, Analista Contable"
                className={`h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all font-medium text-sm ${errors.nombre ? 'border-red-500' : ''}`}
                disabled={saveLoading}
              />
              {errors.nombre && (
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1">
                  <X className="w-3 h-3" /> {errors.nombre.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1 flex items-center gap-2">
                  <CodeIcon className="w-3 h-3" /> Código Interno <span className="text-red-500">*</span>
                </label>
                <Input
                  id="codigo"
                  {...register("codigo", { required: "El código es obligatorio" })}
                  placeholder="Ej: GER-OPS, ANA-CONT"
                  className={`h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all font-mono text-sm ${errors.codigo ? 'border-red-500' : ''}`}
                  disabled={saveLoading}
                />
                {errors.codigo && (
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1">
                    <X className="w-3 h-3" /> {errors.codigo.message}
                  </p>
                )}
              </div>

              {/* Salario Base */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1 flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Salario Base <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <Input
                    id="salarioBase"
                    type="number"
                    step="0.01"
                    {...register("salarioBase", { 
                      required: "El salario es obligatorio",
                      min: { value: 0, message: "Mínimo 0" }
                    })}
                    placeholder="0.00"
                    className={`h-12 pl-9 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all font-medium text-sm ${errors.salarioBase ? 'border-red-500' : ''}`}
                    disabled={saveLoading}
                  />
                </div>
                {errors.salarioBase && (
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1">
                    <X className="w-3 h-3" /> {errors.salarioBase.message}
                  </p>
                )}
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
          disabled={saveLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 h-12 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={saveLoading}
          className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 h-12 font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-3"
        >
          {saveLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Registro
            </>
          )}
        </Button>
      </div>
    </div>
  );
}