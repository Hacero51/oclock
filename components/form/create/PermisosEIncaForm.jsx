"use client";

import { useState, useEffect, useContext } from "react";
import { DashboardContext } from "@/app/dashboard/layout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Permiso/Incapacidad</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Empleado *</label>
              <Input 
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {showResults && searchTerm.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredEmpleados.length > 0 ? (
                    filteredEmpleados.map((emp) => (
                      <div 
                        key={emp.Oid}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                        onClick={() => handleSelectEmpleado(emp)}
                      >
                        {emp.FirstName} {emp.LastName}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No se encontraron resultados</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
              <select 
                value={formData.tipo} 
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                className="w-full flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar tipo</option>
                {tiposPermiso.map((tipo) => (
                  <option key={tipo.Oid} value={tipo.Oid}>
                    {tipo.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inicio *</label>
                <Input type="datetime-local" value={formData.inicio} onChange={(e) => handleInputChange("inicio", e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fin *</label>
                <Input type="datetime-local" value={formData.fin} onChange={(e) => handleInputChange("fin", e.target.value)} className="w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nota</label>
              <Textarea placeholder="Observaciones..." value={formData.nota} onChange={(e) => handleInputChange("nota", e.target.value)} rows={3} className="w-full" />
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button onClick={handleGuardar} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6">Guardar</Button>
            <Button onClick={handleLimpiar} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 px-6">Limpiar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}