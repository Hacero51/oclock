"use client";

import { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Calendar, Users, CalendarSync, Fingerprint } from "lucide-react";
import { DashboardContext } from "@/app/dashboard/layout";

export default function TurnosForm({ onClose }) {
  const { estadoEmpleados } = useContext(DashboardContext);
  const [activeTab, setActiveTab] = useState("horarios");
  const [formData, setFormData] = useState({
    nombre: "",
    rotacion: "Semana",
    festivos: "no_trabaja",
    numeroCiclos: "",
    estado: "activo",
    tiempoExtraMinimo: "",
    adicionarTiempoExtra: "",
    tiempoExtra: {
      antesEntrada: false,
      despuesSalida: false,
      enComida: false,
      enFestivo: false
    }
  });

  const [horarios, setHorarios] = useState([]);
  const [availableTimetables, setAvailableTimetables] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedMarcaciones, setSelectedMarcaciones] = useState(new Set());
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [timeRes, empRes] = await Promise.all([
          fetch('/api/horarios'),
          fetch('/api/empleados')
        ]);

        if (timeRes.ok) setAvailableTimetables(await timeRes.json());
        if (empRes.ok) setEmployees(await empRes.json());
      } catch (error) {
        console.error("Error loading resources:", error);
      }
    };
    fetchResources();
  }, []);

  // Sync Grid with Cycles
  // Sync Grid with Cycles
  // Sync Grid with Cycles
  useEffect(() => {
    const cycles = parseInt(formData.numeroCiclos) || 0;
    const daysPerCycle = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    let totalDays = 0;
    if (formData.rotacion === "Semana") {
      totalDays = cycles * 7;
    } else {
      totalDays = cycles;
    }

    setHorarios(prev => {
      const newGrid = [...prev];
      if (totalDays > newGrid.length) {
        for (let i = newGrid.length; i < totalDays; i++) {
          newGrid.push({
            day: i + 1,
            dayName: daysPerCycle[i % 7],
            timetableId: "",
            mustMarkOut: false,
            startShiftMarkingIn: false,
            markingOptional: false
          });
        }
      } else if (totalDays < newGrid.length) {
        newGrid.length = totalDays;
      }
      return newGrid;
    });
  }, [formData.numeroCiclos, formData.rotacion]);

  const handleGridChange = (index, field, value) => {
    setHorarios(prev => {
      const g = [...prev];
      g[index] = { ...g[index], [field]: value };
      return g;
    });
  };

  const toggleEmployee = (oid) => {
    setSelectedEmployees(prev => {
      const s = new Set(prev);
      if (s.has(oid)) s.delete(oid);
      else s.add(oid);
      return s;
    });
  };

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleExtraChange = (f) => setFormData(prev => ({
    ...prev, tiempoExtra: { ...prev.tiempoExtra, [f]: !prev.tiempoExtra[f] }
  }));

  const handleGuardar = async () => {
    if (!formData.nombre) return alert("Nombre obligatorio");
    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, horarios, empleados: Array.from(selectedEmployees) })
      });
      if (!res.ok) throw new Error("Error");
      if (onClose) onClose();
      window.location.reload();
    } catch (e) { alert("Error guardando"); }
  };

  const filteredEmp = employees.filter(e => {
    const matchesSearch = e["Nombre a mostrar"]?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e["Número Lector"]?.toString().includes(employeeSearch);

    let matchesStatus = true;
    if (estadoEmpleados === "activos") matchesStatus = e.Status === 0;
    else if (estadoEmpleados === "inactivos") matchesStatus = e.Status !== 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex flex-col font-sans">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-3 md:px-8 py-3 md:py-6 border-b-2 md:border-b-4 border-indigo-800 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="p-1.5 md:p-4 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 md:border-2">
                <CalendarSync className="h-4 w-4 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-base md:text-2xl font-bold text-white">Generar un Turno</h2>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 hover:text-white shrink-0"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6 custom-scrollbar">

          {/* TOP SECTION: Blue Banner for General Info */}
          <div className="bg-blue-600 rounded-xl p-6 shadow-lg text-white space-y-6">

            {/* 1. Nombre - Full Width */}
            <div className="">
              <label className="text-xs font-bold uppercase text-blue-100 mb-1.5 block tracking-wider">Nombre del Turno</label>
              <Input
                value={formData.nombre}
                onChange={e => handleInputChange("nombre", e.target.value)}
                className="text-black border-none h-10"
                placeholder="Ej. Planta"
              />
            </div>

            {/* SEPARATOR: Información del Turno */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-100 uppercase tracking-widest border-b border-blue-400/30 pb-2">Información del Turno</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Row 1, Col 1: Rotacion */}
                <div>
                  <label className="text-xs font-medium text-blue-200 mb-1.5 block">Rotación</label>
                  <Select value={formData.rotacion} onValueChange={v => handleInputChange("rotacion", v)}>
                    <SelectTrigger className="text-black border-none h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dia">Dia</SelectItem>
                      <SelectItem value="Semana">Semana</SelectItem>
                      <SelectItem value="Mes">Mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 1, Col 2: Festivos */}
                <div>
                  <label className="text-xs font-medium text-blue-200 mb-1.5 block">Festivos</label>
                  <Select value={formData.festivos} onValueChange={v => handleInputChange("festivos", v)}>
                    <SelectTrigger className="text-black border-none h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_trabaja_dias_de_fiesta">No trabaja dias de fiesta</SelectItem>
                      <SelectItem value="trabaja_dias_de_fiesta">Trabaja dias de fiesta</SelectItem>
                      <SelectItem value="trabaja_ocacionalmente_dias_de_fiesta">Trabaja ocacionalmente dias de fiesta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2, Col 1: Ciclos */}
                <div>
                  <label className="text-xs font-medium text-blue-200 mb-1.5 block">Número de Ciclos</label>
                  <Input
                    type="number"
                    value={formData.numeroCiclos}
                    onChange={e => handleInputChange("numeroCiclos", e.target.value)}
                    className="text-black border-none h-10"
                    placeholder="0"
                  />
                </div>

                {/* Row 2, Col 2: Estado */}
                <div>
                  <label className="text-xs font-medium text-blue-200 mb-1.5 block">Estado</label>
                  <Select value={formData.estado} onValueChange={v => handleInputChange("estado", v)}>
                    <SelectTrigger className="text-black border-none h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SEPARATOR: Configuración de Tiempo Extra */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-blue-100 uppercase tracking-widest border-b border-blue-400/30 pb-2">Configuración de Tiempo Extra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Col: Inputs */}
                <div className="space-y-4">
                  {/* Adicionar Tiempo Extra */}
                  <div>
                    <label className="text-xs font-medium text-blue-200 mb-1.5 block">Adicionar Tiempo Extra</label>
                    <Select value={formData.adicionarTiempoExtra?.toString()} onValueChange={v => handleInputChange("adicionarTiempoExtra", v)}>
                      <SelectTrigger className="text-black border-none h-10"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(m => (
                          <SelectItem key={m} value={m.toString()}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tiempo Extra Minimo */}
                  <div>
                    <label className="text-xs font-medium text-blue-200 mb-1.5 block">Tiempo Extra Mínimo</label>
                    <Input
                      type="number"
                      value={formData.tiempoExtraMinimo}
                      onChange={e => handleInputChange("tiempoExtraMinimo", e.target.value)}
                      className="text-black border-none h-10"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Right Col: Checkboxes (Vertical Stack) */}
                <div className="bg-blue-800/20 rounded-lg p-4 space-y-3">
                  {[
                    ['antesEntrada', 'Tiempo Extra Antes de la Entrada'],
                    ['despuesSalida', 'Tiempo Extra Después de la Salida'],
                    ['enComida', 'Tiempo Extra en la Comida'],
                    ['enFestivo', 'Tiempo Extra en Festivo']
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer group hover:bg-white/5 p-1 rounded transition-colors">
                      <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.tiempoExtra[key] ? 'bg-white border-white text-blue-600' : 'border-blue-300/50 bg-transparent'}`}>
                        {formData.tiempoExtra[key] && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.tiempoExtra[key]} onChange={() => handleExtraChange(key)} />
                      <span className={`text-sm leading-tight transition-colors ${formData.tiempoExtra[key] ? 'text-white font-medium' : 'text-blue-200 group-hover:text-blue-100'}`}>{label}</span>
                    </label>
                  ))}
                </div>

              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: Content Area with Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">

            {/* Tabs Header */}
            <div className="flex items-center gap-6 px-6 border-b border-gray-100 overflow-x-auto">
              <button
                onClick={() => setActiveTab('horarios')}
                className={`py-4 text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-b-2 transition-all shrink-0 ${activeTab === 'horarios' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Calendar className="w-4 h-4" /> Horarios
              </button>
              <button
                onClick={() => setActiveTab('empleados')}
                className={`py-4 text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-b-2 transition-all shrink-0 ${activeTab === 'empleados' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Users className="w-4 h-4" /> Empleados <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{selectedEmployees.size}</span>
              </button>
              <button
                onClick={() => setActiveTab('marcaciones')}
                className={`py-4 text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-b-2 transition-all shrink-0 ${activeTab === 'marcaciones' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Fingerprint className="w-4 h-4" /> Marcaciones <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{selectedMarcaciones.size}</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-0 bg-white">

              {/* TAB: HORARIOS */}
              {activeTab === 'horarios' && (
                <div className="h-full">
                  {horarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                      <Calendar className="w-16 h-16 mb-4 text-gray-200" />
                      <p className="text-lg font-medium text-gray-500">Sin ciclos definidos</p>
                      <p className="text-sm">Ingrese el número de ciclos en la tarjeta azul superior.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                          <tr>
                            <th className="px-6 py-4 w-[120px]">Día</th>
                            <th className="px-6 py-4 min-w-[300px]">Horario Asignado</th>
                            <th className="px-6 py-4 text-center w-[120px]">Salida</th>
                            <th className="px-6 py-4 text-center w-[120px]">Inicio Auto</th>
                            <th className="px-6 py-4 text-center w-[120px]">Opcional</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {horarios.map((row, index) => (
                            <tr key={index} className="hover:bg-blue-50/20 transition-colors group">
                              <td className="px-6 py-4 font-medium text-gray-900 border-l-4 border-transparent group-hover:border-blue-500 transition-all bg-white capitalize">
                                {row.dayName}
                              </td>
                              <td className="px-6 py-4">
                                <Select value={row.timetableId} onValueChange={v => handleGridChange(index, "timetableId", v)}>
                                  <SelectTrigger className="bg-white border-gray-200 h-auto min-h-[40px] py-2 w-full text-left whitespace-normal leading-snug">
                                    <SelectValue placeholder="Seleccione Horario..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableTimetables.map(t => (
                                      <SelectItem key={t.Oid} value={t.Oid}>{t.DisplayName || t.Name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input type="checkbox" checked={row.mustMarkOut} onChange={e => handleGridChange(index, "mustMarkOut", e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input type="checkbox" checked={row.startShiftMarkingIn} onChange={e => handleGridChange(index, "startShiftMarkingIn", e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input type="checkbox" checked={row.markingOptional} onChange={e => handleGridChange(index, "markingOptional", e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: EMPLEADOS */}
              {activeTab === 'empleados' && (
                <div className="flex flex-col h-[500px]">
                  <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between gap-4 sticky top-0 z-10">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre o código..."
                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        value={employeeSearch}
                        onChange={e => setEmployeeSearch(e.target.value)}
                      />
                    </div>
                    <div className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-md">
                      Mostrando {filteredEmp.length} empleados
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm min-w-max">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-6 py-3.5 w-[80px] text-center">Asignar</th>
                          <th className="px-6 py-3.5 text-left">Número</th>
                          <th className="px-6 py-3.5 text-left">Documento</th>
                          <th className="px-6 py-3.5 text-left">Nombre</th>
                          <th className="px-6 py-3.5 text-left">Cargo</th>
                          <th className="px-6 py-3.5 text-left">Departamento</th>
                          <th className="px-6 py-3.5 text-left">Contrato</th>
                          <th className="px-6 py-3.5 text-left">Jefe</th>
                          <th className="px-6 py-3.5 text-left">Valor Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredEmp.map(emp => {
                          const isSel = selectedEmployees.has(emp.Oid);
                          return (
                            <tr
                              key={emp.Oid}
                              onClick={() => toggleEmployee(emp.Oid)}
                              className={`cursor-pointer transition-colors group ${isSel ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                              <td className="px-6 py-3.5 text-center">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all ${isSel ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'}`}>
                                  {isSel && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                              </td>
                              <td className="px-6 py-3.5 text-gray-500 font-mono text-sm">{emp["Número Lector"] || "-"}</td>
                              <td className="px-6 py-3.5 text-gray-700 text-sm">{emp.Documento || "-"}</td>
                              <td className={`px-6 py-3.5 font-medium text-sm transition-colors ${isSel ? 'text-blue-700' : 'text-gray-700'}`}>{emp["Nombre a mostrar"]}</td>
                              <td className="px-6 py-3.5 text-gray-500 text-sm uppercase">{emp.Cargo || "-"}</td>
                              <td className="px-6 py-3.5 text-gray-500 text-sm uppercase">{emp.Departamento || "-"}</td>
                              <td className="px-6 py-3.5 text-gray-500 text-sm uppercase">{emp.Contrato || "-"}</td>
                              <td className="px-6 py-3.5 text-gray-500 text-sm uppercase">{emp.Jefe || "-"}</td>
                              <td className="px-6 py-3.5 text-gray-500 text-sm">{emp["Valor Hora"] ? `$ ${emp["Valor Hora"]}` : "-"}</td>
                            </tr>
                          )
                        })}
                        {filteredEmp.length === 0 && (
                          <tr><td colSpan={9} className="p-12 text-center text-gray-400 italic">No se encontraron empleados ({estadoEmpleados})</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* TAB: MARCACIONES (SKELETON) */}
              {activeTab === 'marcaciones' && (
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-400 text-center p-8">
                  <Fingerprint className="w-16 h-16 mb-4 text-gray-200" />
                  <p className="text-lg font-medium text-gray-500">Configuración de Marcaciones</p>
                  <p className="text-sm max-w-sm mt-2">Esta funcionalidad está en desarrollo. Pronto podrá configurar terminales y reglas de marcación específicas para este turno.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-800 hover:bg-gray-100">
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6">
            Guardar Turno
          </Button>
        </div>

      </div>
    </div>
  );
}