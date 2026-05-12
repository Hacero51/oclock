"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Building,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Hash,
  Tag
} from "lucide-react";

export default function CentroCostoForm({ onClose }) {
  const [form, setForm] = useState({
    Code: "",
    Name: "",
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Name") {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
      if (!regex.test(value)) return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.Name.trim()) newErrors.Name = "El nombre es obligatorio";
    if (form.Code && form.Code.length > 20) newErrors.Code = "Máximo 20 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);
    try {
      const payload = {
        Code: form.Code.trim() || null,
        Name: form.Name.trim(),
      };

      const res = await fetch("/api/centrocostos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error creando centro de costo");
      
      if (onClose) onClose();
      window.dispatchEvent(new CustomEvent('refreshCentroCostosList'));
    } catch (error) {
      setErrors({ form: error.message });
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
            <Building className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Nuevo Centro de Costo</h2>
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
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-900 text-sm italic">Organización Estructural</p>
            <p className="text-blue-700/80 text-xs leading-relaxed">
              Defina el centro de costo para agrupar empleados y facilitar el análisis de gastos y reportes operativos por departamento o línea.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            
            {/* Campo: Código */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1 flex items-center gap-2">
                <Hash className="w-3 h-3" /> Código de Identificación
              </label>
              <Input
                name="Code"
                value={form.Code}
                onChange={handleChange}
                placeholder="Ej: CC-001, PRODUCCION-1"
                className={`h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all font-mono text-sm ${errors.Code ? 'border-red-500' : ''}`}
                disabled={saveLoading}
              />
              {errors.Code && (
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1 animate-in slide-in-from-left-1">
                  <X className="w-3 h-3" /> {errors.Code}
                </p>
              )}
            </div>

            {/* Campo: Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] block ml-1 flex items-center gap-2">
                <Tag className="w-3 h-3" /> Nombre del Centro de Costo <span className="text-red-500">*</span>
              </label>
              <Input
                name="Name"
                value={form.Name}
                onChange={handleChange}
                placeholder="Ej: Departamento de Ventas, Planta Norte"
                className={`h-12 border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all font-medium text-sm ${errors.Name ? 'border-red-500' : ''}`}
                disabled={saveLoading}
              />
              {errors.Name && (
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1.5 flex items-center gap-1 ml-1 animate-in slide-in-from-left-1">
                  <X className="w-3 h-3" /> {errors.Name}
                </p>
              )}
            </div>

          </div>

          {errors.form && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold uppercase animate-in shake-1">
              <AlertCircle className="w-4 h-4" /> {errors.form}
            </div>
          )}
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
          onClick={handleSubmit} 
          disabled={saveLoading}
          className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 h-12 font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-3"
        >
          {saveLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
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