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
import { Search, X, Calendar, CalendarSync, Users, Fingerprint } from "lucide-react";
import { DashboardContext } from "@/app/dashboard/layout";
import { Pagination } from "@/components/ui/Pagination";

export default function UpdateTurnoForm({ data, onClose }) {
  const { estadoEmpleados } = useContext(DashboardContext);
  const [activeTab, setActiveTab] = useState("horarios");
  const [formData, setFormData] = useState({
    nombre: "",
    rotacion: "",
    festivos: "",
    numeroCiclos: "",
    estado: "",
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
  const [marcaciones, setMarcaciones] = useState([]);
  const [marcacionesLoading, setMarcacionesLoading] = useState(false);
  const [periodo, setPeriodo] = useState("30");
  const [marcacionesPage, setMarcacionesPage] = useState(1);
  const [marcacionesTotalPages, setMarcacionesTotalPages] = useState(1);
  const [marcacionesTotalItems, setMarcacionesTotalItems] = useState(0);

  const [employeesPage, setEmployeesPage] = useState(1);
  const itemsPerPageEmployees = 15;


  // Resources
  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const res = await fetch('/api/horarios');
        if (res.ok) setAvailableTimetables(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchTimetables();
  }, []);

  // Sync Data
  useEffect(() => {
    if (data?.Oid) {
      fetch(`/api/turnos/${data.Oid}`)
        .then(res => res.json())
        .then(details => {
          const rotation = details.rotacion || "Semana";
          const cycles = parseInt(details.numeroCiclos) || 1;

          setFormData({
            nombre: details.nombre || "",
            rotacion: rotation,
            festivos: details.festivos || "no_trabaja_dias_de_fiesta",
            numeroCiclos: details.numeroCiclos || "",
            estado: details.estado || "activo",
            adicionarTiempoExtra: details.adicionarTiempoExtra || "",
            tiempoExtraMinimo: details.tiempoExtraMinimo || "",
            tiempoExtra: details.tiempoExtra || {
              antesEntrada: false,
              despuesSalida: false,
              enComida: false,
              enFestivo: false
            }
          });

          // Hydrate Grid correctly based on NumberDay
          if (details.horarios) {
            const daysPerCycle = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

            // Calculate expected total days similar to the grid sync logic
            let totalDays = 0;
            if (rotation === "Semana") {
              totalDays = cycles * 7;
            } else {
              totalDays = cycles;
            }

            // Create base grid
            const newGrid = [];
            for (let i = 0; i < totalDays; i++) {
              newGrid.push({
                day: i + 1,
                dayName: daysPerCycle[i % 7],
                timetableId: "",
                mustMarkOut: false,
                startShiftMarkingIn: false,
                markingOptional: false
              });
            }

            // Fill with fetched data
            details.horarios.forEach(h => {
              // Use 'day' (NumberDay) as index 1-based
              const index = (h.day || h.NumberDay || 1) - 1;
              if (index >= 0 && index < newGrid.length) {
                newGrid[index] = {
                  ...newGrid[index], // Keep default struct
                  timetableId: h.timetableId || "",
                  mustMarkOut: h.mustMarkOut,
                  startShiftMarkingIn: h.startShiftMarkingIn,
                  markingOptional: h.markingOptional
                };
              }
            });

            setHorarios(newGrid);
          }

          if (details.empleados) {
            const mapped = details.empleados.map(e => ({
              ...e,
              Status: e.Status !== undefined ? e.Status : null
            }));
            setEmployees(mapped);
            setSelectedEmployees(new Set(details.empleados.filter(e => e.Assigned).map(e => e.Oid)));
          }
        })
        .catch(err => console.error("Error loading turno:", err));
    }
  }, [data]);

  // Load Marcaciones
  useEffect(() => {
    if (activeTab === "marcaciones" && data?.Oid) {
      const fetchMarcaciones = async () => {
        setMarcacionesLoading(true);
        try {
          // Calcular fecha desde según el periodo
          const desdeDate = new Date();
          if (periodo !== "all") {
            desdeDate.setDate(desdeDate.getDate() - parseInt(periodo));
          } else {
            desdeDate.setFullYear(desdeDate.getFullYear() - 2); // 2 años para "total"
          }
          const desde = desdeDate.toISOString().split('T')[0];

          const res = await fetch(`/api/marcaciones?turno=${data.Oid}&desde=${desde}&limit=50&page=${marcacionesPage}`);
          const json = await res.json();
          setMarcaciones(json.data || []);
          setMarcacionesTotalPages(json.pagination?.totalPages || 1);
          setMarcacionesTotalItems(json.pagination?.total || 0);
        } catch (err) {
          console.error("Error loading marcaciones:", err);
        } finally {
          setMarcacionesLoading(false);
        }
      };
      fetchMarcaciones();
    }
  }, [activeTab, data?.Oid, periodo, marcacionesPage]);

  // Reset page on filter change
  useEffect(() => {
    setMarcacionesPage(1);
  }, [periodo]);

  useEffect(() => {
    setEmployeesPage(1);
  }, [employeeSearch]);

  // Sync Grid with Cycles
  useEffect(() => {
    const cycles = parseInt(formData.numeroCiclos) || 0;
    const daysPerCycle = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    setHorarios(prev => {
      let totalDays = 0;
      if (formData.rotacion === "Semana") {
        totalDays = cycles * 7;
      } else {
        totalDays = cycles;
      }

      const newGrid = [...prev];
      if (totalDays > newGrid.length) {
        for (let i = newGrid.length; i < totalDays; i++) {
          const dayNumber = i + 1;
          newGrid.push({
            day: dayNumber,
            dayName: daysPerCycle[(dayNumber - 1) % 7],
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


  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
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
  const handleExtraChange = (f) => setFormData(prev => ({
    ...prev, tiempoExtra: { ...prev.tiempoExtra, [f]: !prev.tiempoExtra[f] }
  }));

  const handleGuardar = async () => {
    if (!formData.nombre) return alert("Nombre obligatorio");
    try {
      const res = await fetch(`/api/turnos/${data.Oid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, horarios, empleados: Array.from(selectedEmployees) })
      });
      if (!res.ok) throw new Error("Error");
      if (onClose) onClose();
      window.location.reload();
    } catch (err) { 
      console.error(err);
      alert("Error actualizando"); 
    }
  };

  const filteredEmp = employees.filter(e => {
    const matchesSearch = e["Nombre a mostrar"]?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e["Número Lector"]?.toString().includes(employeeSearch);

    // Check if Status is available. Note: API/turnos/[id] returns minimal employee info.
    // If Status is missing, we might not be able to filter. 
    // However, the prompt says "update turno ya que me los esta trayendo todos".
    // I need to ensure GET /api/turnos/[id] returns Status for employees.

    let matchesStatus = true;
    if (e.Status !== null && e.Status !== undefined) {
      if (estadoEmpleados === "activos") matchesStatus = e.Status === 0;
      else if (estadoEmpleados === "inactivos") matchesStatus = e.Status !== 0;
    }

    return matchesSearch && matchesStatus;
  });

  const paginatedEmployees = filteredEmp.slice(
    (employeesPage - 1) * itemsPerPageEmployees,
    employeesPage * itemsPerPageEmployees
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="bg-indigo rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col font-sans overflow-hidden">

        {/* Header */}
        <div className="bg-[#1e40af] px-6 py-5 flex items-center justify-between border-b border-blue-800/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <CalendarSync className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Actualizar Turno</h2>
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

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6 custom-scrollbar">

          {/* TOP SECTION: Blue Banner */}
          <div className="bg-blue-600 rounded-xl p-6 shadow-lg text-white space-y-6">

            {/* 1. Nombre - Full Width */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-blue-100/80 tracking-widest block">Nombre del Turno</label>
              <Input
                value={formData.nombre}
                onChange={e => handleInputChange("nombre", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 focus:bg-white focus:text-black transition-all"
              />
            </div>

            {/* SEPARATOR: Información del Turno */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-black-100 uppercase tracking-widest border-b border-black-400/30 pb-2">Información del Turno</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Row 1, Col 1: Rotacion */}
                <div>
                  <label className="text-xs font-medium text-black-100 mb-1.5 block">Rotación</label>
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
                  <label className="text-xs font-medium text-black-100 mb-1.5 block">Festivos</label>
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
                  <label className="text-xs font-medium text-black-100 mb-1.5 block">Número de Ciclos</label>
                  <Input
                    type="number"
                    value={formData.numeroCiclos}
                    onChange={e => handleInputChange("numeroCiclos", e.target.value)}
                    className="text-black border-none h-10"
                  />
                </div>

                {/* Row 2, Col 2: Estado */}
                <div>
                  <label className="text-xs font-medium text-black-100 mb-1.5 block">Estado</label>
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
              <h3 className="text-sm font-bold text-black-100 uppercase tracking-widest border-b border-black-400/30 pb-2">Configuración de Tiempo Extra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Col: Inputs */}
                <div className="space-y-4">
                  {/* Adicionar Tiempo Extra */}
                  <div>
                    <label className="text-xs font-medium text-black-100 mb-1.5 block">Adicionar Tiempo Extra</label>
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
                    <label className="text-xs font-medium text-black-100 mb-1.5 block">Tiempo Extra Mínimo</label>
                    <Input
                      type="number"
                      value={formData.tiempoExtraMinimo}
                      onChange={e => handleInputChange("tiempoExtraMinimo", e.target.value)}
                      className="text-black border-none h-10"
                    />
                  </div>
                </div>

                {/* Right Col: Checkboxes (Vertical Stack) */}
                <div className="bg-black-800/20 rounded-lg p-4 space-y-3">
                  {[
                    ['antesEntrada', 'Tiempo Extra Antes de la Entrada'],
                    ['despuesSalida', 'Tiempo Extra Después de la Salida'],
                    ['enComida', 'Tiempo Extra en la Comida'],
                    ['enFestivo', 'Tiempo Extra en Festivo']
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer group hover:bg-white/5 p-1 rounded transition-colors">
                      <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.tiempoExtra[key] ? 'bg-white border-white text-black-600' : 'border-black-300/50 bg-transparent'}`}>
                        {formData.tiempoExtra[key] && <div className="w-2.5 h-2.5 bg-black-600 rounded-sm" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.tiempoExtra[key]} onChange={() => handleExtraChange(key)} />
                      <span className={`text-sm leading-tight transition-colors ${formData.tiempoExtra[key] ? 'text-white font-medium' : 'text-black-200 group-hover:text-black-100'}`}>{label}</span>
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
                      <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold tracking-wider sticky top-0 z-10 shadow-sm">
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
                        {paginatedEmployees.map(emp => {
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
                  {filteredEmp.length > itemsPerPageEmployees && (
                    <Pagination
                      currentPage={employeesPage}
                      totalPages={Math.ceil(filteredEmp.length / itemsPerPageEmployees)}
                      totalItems={filteredEmp.length}
                      itemsPerPage={itemsPerPageEmployees}
                      onPageChange={setEmployeesPage}
                      label="empleados"
                    />
                  )}
                </div>
              )}
              {/* TAB: MARCACIONES */}
              {activeTab === 'marcaciones' && (
                <div className="flex flex-col h-[500px]">
                  <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-700">Registros de Marcación del Turno</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Periodo:</label>
                      <Select value={periodo} onValueChange={setPeriodo}>
                        <SelectTrigger className="h-8 text-[11px] w-[140px] bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Seleccionar periodo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">Últimos 15 días</SelectItem>
                          <SelectItem value="30">Últimos 30 días</SelectItem>
                          <SelectItem value="60">Últimos 60 días</SelectItem>
                          <SelectItem value="all">Todo el historial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {marcacionesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-gray-500">Cargando marcaciones...</p>
                      </div>
                    ) : marcaciones.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                        <Fingerprint className="w-16 h-16 mb-4 text-gray-200" />
                        <p className="text-lg font-medium text-gray-500">No hay marcaciones registradas</p>
                        <p className="text-sm max-w-sm mt-2">No se han encontrado registros de entrada o salida para este turno en el periodo actual.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm min-w-max">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-6 py-3.5 text-left">Empleado</th>
                            <th className="px-6 py-3.5 text-left">Fecha</th>
                            <th className="px-6 py-3.5 text-left">Entrada</th>
                            <th className="px-6 py-3.5 text-left">Salida</th>
                            <th className="px-6 py-3.5 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {marcaciones.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3.5">
                                <div className="font-medium text-gray-900">{m.empleado}</div>
                                <div className="text-xs text-gray-500">{m.cedula}</div>
                              </td>
                              <td className="px-6 py-3.5 text-gray-600">{m.fecha}</td>
                              <td className="px-6 py-3.5">
                                <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                                  {m.entrada || "-"}
                                </span>
                              </td>
                              <td className="px-6 py-3.5">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${m.salida && !m.salida.includes("SIN SALIDA") ? "bg-red-50 text-red-700 border-red-100" : "bg-yellow-50 text-yellow-700 border-yellow-100"}`}>
                                  {m.salida || "SIN SALIDA"}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.estado === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {m.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {marcacionesTotalItems > 50 && (
                    <Pagination
                      currentPage={marcacionesPage}
                      totalPages={marcacionesTotalPages}
                      totalItems={marcacionesTotalItems}
                      itemsPerPage={50}
                      onPageChange={setMarcacionesPage}
                      label="marcaciones"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-4 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 h-11 font-medium rounded-lg"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleGuardar} 
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-10 h-11 font-bold rounded-lg shadow-md transition-all active:scale-95"
          >
            Guardar Cambios
          </Button>
        </div>

      </div>
    </div>
  );
}