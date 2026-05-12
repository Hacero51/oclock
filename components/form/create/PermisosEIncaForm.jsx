"use client";

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Search, X, Calendar } from "lucide-react";

export default function PermisosEIncaForm({ onClose }) {
  const { estadoEmpleados } = useContext(DashboardContext);

  const [formData, setFormData] = useState({
    empleado: "",
    tipo: "",
    inicio: "",
    fin: "",
    nota: ""
  });

  const [empleados, setEmpleados] = useState([]);
  const [tiposPermiso, setTiposPermiso] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch(`/api/permisos-incapacidades?type=meta&estado=${estadoEmpleados}`);
        const data = await res.json();
        setEmpleados(data.employees || []);
        setTiposPermiso(data.incTypes || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMeta();
  }, [estadoEmpleados]);

  const filteredEmpleados = empleados.filter(emp => {
    const fullName = `${emp.FirstName || ""} ${emp.LastName || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  }).slice(0, 50);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectEmpleado = (emp) => {
    handleInputChange("empleado", emp.Oid);
    setSearchTerm(`${emp.FirstName} ${emp.LastName}`);
    setShowResults(false);
  };

  const handleLimpiar = () => {
    setFormData({ empleado: "", tipo: "", inicio: "", fin: "", nota: "" });
    setSearchTerm("");
  };

  const handleGuardar = async () => {
    if (!formData.empleado || !formData.tipo || !formData.inicio || !formData.fin) {
      alert("Por favor complete los campos obligatorios: Empleado, Tipo, Inicio y Fin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/permisos-incapacidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Error al guardar");
      alert("Registro guardado exitosamente");
      handleLimpiar();
      if (onClose) onClose();
      window.location.reload();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-semibold text-white tracking-tight">Registrar Novedad</h2>
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

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/30">
        
        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          
          {/* Empleado con Buscador Mejorado */}
          <div className="relative">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-2">Colaborador *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text"
                placeholder="Buscar por nombre o apellido..."
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50/50"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
            </div>
            
            {showResults && searchTerm.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto divide-y divide-gray-50">
                {filteredEmpleados.length > 0 ? (
                  filteredEmpleados.map((emp) => (
                    <div 
                      key={emp.Oid}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm flex items-center justify-between group transition-colors"
                      onClick={() => handleSelectEmpleado(emp)}
                    >
                      <span className="font-medium text-gray-700">{emp.FirstName} {emp.LastName}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors uppercase">Seleccionar</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-gray-400 italic text-center">No se encontraron colaboradores</div>
                )}
              </div>
            )}
          </div>

          {/* Tipo de Novedad */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-2">Tipo de Novedad *</label>
            <select 
              value={formData.tipo} 
              onChange={(e) => handleInputChange("tipo", e.target.value)}
              className="w-full flex h-11 items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">Seleccionar tipo de novedad...</option>
              {tiposPermiso.map((tipo) => (
                <option key={tipo.Oid} value={tipo.Oid}>
                  {tipo.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-2">Fecha de Inicio *</label>
              <Input 
                type="datetime-local" 
                value={formData.inicio} 
                onChange={(e) => handleInputChange("inicio", e.target.value)} 
                className="h-11 border-gray-200 bg-gray-50/50" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-2">Fecha de Fin *</label>
              <Input 
                type="datetime-local" 
                value={formData.fin} 
                onChange={(e) => handleInputChange("fin", e.target.value)} 
                className="h-11 border-gray-200 bg-gray-50/50" 
              />
            </div>
          </div>

          {/* Justificación */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-2">Justificación / Nota</label>
            <Textarea 
              placeholder="Describa brevemente el motivo de la novedad..." 
              value={formData.nota} 
              onChange={(e) => handleInputChange("nota", e.target.value)} 
              rows={4} 
              className="w-full border-gray-200 bg-gray-50/50 focus:ring-1 focus:ring-blue-500 transition-all resize-none" 
            />
          </div>

        </div>

      </div>

      {/* Footer Estilizado */}
      <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 shrink-0">
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 h-11 font-medium rounded-lg"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleGuardar} 
          disabled={loading} 
          className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-10 h-11 font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Novedad"}
        </Button>
      </div>

    </div>
  );
}