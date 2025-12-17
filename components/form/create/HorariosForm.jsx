'use client';
import { useState, useEffect } from 'react';
import { Clock, X, Settings, AlertTriangle, CalendarDays, Plus, Trash2, CheckCircle, XCircle, CalendarOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';

export default function HorariosForm({ onClose }) {
  const [nombreHorario, setNombreHorario] = useState('');
  const [tipoHorario, setTipoHorario] = useState('fijo');
  const [entrada, setEntrada] = useState('09:00');
  const [salida, setSalida] = useState('18:00');
  const [incluirComida, setIncluirComida] = useState(false);
  const [salidaComida, setSalidaComida] = useState('14:00');
  const [entradaComida, setEntradaComida] = useState('15:00');
  const [retardo, setRetardo] = useState('00:00:00');
  const [tiempoTrabajo, setTiempoTrabajo] = useState('08:00:00');
  const [descuentoComida, setDescuentoComida] = useState('00:00:00');
  const [headerName, setHeaderName] = useState('');

  // Refactored State: Array of Objects
  const [turnosAsociados, setTurnosAsociados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Turnos
  const [showModalTurnos, setShowModalTurnos] = useState(false);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [formularioTurno, setFormularioTurno] = useState({
    turnoSeleccionado: '',
    diasSeleccionados: [],
    debeMarcarSalida: true,
    iniciaTurnoAl: false,
    marcacionOpcional: false
  });

  const diasSemana = [
    { id: 1, nombre: 'LUNES' }, { id: 2, nombre: 'MARTES' }, { id: 3, nombre: 'MIÉRCOLES' },
    { id: 4, nombre: 'JUEVES' }, { id: 5, nombre: 'VIERNES' }, { id: 6, nombre: 'SÁBADO' }, { id: 7, nombre: 'DOMINGO' }
  ];

  useEffect(() => {
    async function fetchTurnos() {
      try {
        const res = await fetch('/api/turnos');
        const data = await res.json();
        setTurnosDisponibles(data);
      } catch (err) {
        console.error("Error cargando turnos:", err);
      }
    }
    fetchTurnos();
  }, []);

  // Helper functions
  const formatTimeInput = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
  };

  const militarANormal = (horaMilitar) => {
    if (!horaMilitar) return '';
    const [horas, minutos] = horaMilitar.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  };

  function durationToSeconds(duration) {
    if (!duration) return 0;
    const parts = duration.split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    const s = parseInt(parts[2] || '0', 10);
    return h * 3600 + m * 60 + s;
  }

  function secondsToDuration(seconds) {
    if (!seconds || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }


  useEffect(() => {
    if (tipoHorario === 'fijo') {
      if (!entrada || !salida) return;
      const [hEntrada, mEntrada] = entrada.split(':').map(Number);
      const [hSalida, mSalida] = salida.split(':').map(Number);
      let totalMinutos = (hSalida * 60 + mSalida) - (hEntrada * 60 + mEntrada);

      if (incluirComida && salidaComida && entradaComida) {
        const [hSalidaComida, mSalidaComida] = salidaComida.split(':').map(Number);
        const [hEntradaComida, mEntradaComida] = entradaComida.split(':').map(Number);
        const minutosComida = (hEntradaComida * 60 + mEntradaComida) - (hSalidaComida * 60 + mSalidaComida);
        totalMinutos -= minutosComida;
      }
      if (totalMinutos < 0) totalMinutos += 24 * 60;

      let nombre = `${militarANormal(entrada)} A ${militarANormal(salida)}`;
      if (incluirComida) {
        nombre += ` CON ALMUERZO DE ${militarANormal(salidaComida)} A ${militarANormal(entradaComida)}`;
      }
      setNombreHorario(nombre);
      setHeaderName(nombre);

    } else {
      // Variable
      const trabajoSeg = durationToSeconds(tiempoTrabajo);
      const descuentoSeg = durationToSeconds(descuentoComida);
      // const totalSeg = Math.max(trabajoSeg - descuentoSeg, 0);

      const [horas, minutos] = tiempoTrabajo.split(':').map(Number);

      const turnosUnicos = new Set(turnosAsociados.map(t => t.Day));
      const tieneUnSoloDia = turnosUnicos.size === 1;
      const dia = tieneUnSoloDia ? Array.from(turnosUnicos)[0] : '';
      const horasTexto = `${horas || 0} HORA${horas !== 1 ? 'S' : ''}`;
      const minText = minutos > 0 ? ` ${minutos} MIN` : '';

      let shortName = '';
      if (tieneUnSoloDia && dia) {
        shortName = `${dia.toUpperCase()} ${horasTexto}${minText} : ${tiempoTrabajo}`;
      } else {
        shortName = `${horasTexto}${minText} : ${tiempoTrabajo}`;
      }
      setNombreHorario(shortName);

      let longName = shortName;
      if (descuentoSeg > 0 && entrada && salida) {
        // Note: Logic copied from update form, might need adjustment if entrada/salida not set for variable
        // But sticking to consistency.
      }
      setHeaderName(longName);
    }
  }, [entrada, salida, incluirComida, salidaComida, entradaComida, tipoHorario, tiempoTrabajo, descuentoComida, turnosAsociados]);


  const removeTurno = (index) => {
    setTurnosAsociados(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTurnoFlag = (index, field, value) => {
    setTurnosAsociados(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const handleFormularioChange = (field, value) => {
    setFormularioTurno(prev => ({ ...prev, [field]: value }));
  };

  const toggleDiaSeleccionado = (dia) => {
    setFormularioTurno(prev => ({
      ...prev,
      diasSeleccionados: prev.diasSeleccionados.includes(dia)
        ? prev.diasSeleccionados.filter(d => d !== dia)
        : [...prev.diasSeleccionados, dia]
    }));
  };

  const agregarTurnoDesdeModal = () => {
    if (!formularioTurno.turnoSeleccionado || formularioTurno.diasSeleccionados.length === 0) {
      alert('Seleccione turno y días');
      return;
    }
    const nuevosTurnos = formularioTurno.diasSeleccionados.map(dia => ({
      Shift: formularioTurno.turnoSeleccionado,
      Day: dia,
      MustMarkingOut: formularioTurno.debeMarcarSalida,
      StartShiftMarkingIn: formularioTurno.iniciaTurnoAl,
      MarkingOptional: formularioTurno.marcacionOpcional
    }));

    setTurnosAsociados(prev => {
      const existingKeys = new Set(prev.map(t => `${t.Shift}-${t.Day}`));
      const toAdd = nuevosTurnos.filter(nt => !existingKeys.has(`${nt.Shift}-${nt.Day}`));
      return [...prev, ...toAdd];
    });

    setFormularioTurno({
      turnoSeleccionado: '',
      diasSeleccionados: [],
      debeMarcarSalida: true,
      iniciaTurnoAl: false,
      marcacionOpcional: false
    });
    setShowModalTurnos(false);
  };


  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const mapDiaNumero = { 'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SÁBADO': 6, 'DOMINGO': 7 };

    const turnosPayload = turnosAsociados.map(t => ({
      Shift: t.Shift,
      Day: t.Day,
      NumberDay: mapDiaNumero[t.Day] || 0,
      MustMarkingOut: t.MustMarkingOut,
      StartShiftMarkingIn: t.StartShiftMarkingIn,
      MarkingOptional: t.MarkingOptional
    }));

    const payload = {
      name: nombreHorario,
      type: tipoHorario,
      entrada,
      salida,
      incluirComida,
      salidaComida,
      entradaComida,
      retardo,
      tiempoTrabajo,
      descuentoComida,
      turnos: turnosPayload
    };

    try {
      const res = await fetch('/api/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Horario creado correctamente');
        if (onClose) onClose();
      } else {
        alert('Error al crear horario');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-full flex flex-col bg-white font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nuevo Horario <span className="text-gray-400 font-normal">| {headerName || 'Sin Nombre'}</span></h2>
            <p className="text-xs text-gray-500">Defina las reglas de la nueva jornada laboral</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Nombre y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre del Horario</label>
              <Input
                value={nombreHorario}
                onChange={(e) => setNombreHorario(e.target.value)}
                placeholder="Ej: Administrativo Diurno"
                className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Horario</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTipoHorario('fijo')}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${tipoHorario === 'fijo' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Fijo
                </button>
                <button
                  type="button"
                  onClick={() => setTipoHorario('variable')}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${tipoHorario === 'variable' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Variable
                </button>
              </div>
            </div>
          </div>

          {/* Configuración Específica */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Configuración {tipoHorario === 'fijo' ? 'Fija' : 'Variable'}</h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {tipoHorario === 'fijo' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Hora de Entrada</label>
                    <Input type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="font-mono bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Hora de Salida</label>
                    <Input type="time" value={salida} onChange={(e) => setSalida(e.target.value)} className="font-mono bg-gray-50" />
                  </div>

                  <div className="md:col-span-2 py-2 border-t border-gray-100 my-2"></div>

                  <div className="md:col-span-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">¿Incluir tiempo de comida?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={incluirComida} onChange={(e) => setIncluirComida(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {incluirComida && (
                    <>
                      <div className="space-y-2 pl-4 border-l-2 border-blue-100">
                        <label className="text-xs font-medium text-gray-500">Salida a Comida</label>
                        <Input type="time" value={salidaComida} onChange={(e) => setSalidaComida(e.target.value)} className="font-mono bg-gray-50" />
                      </div>
                      <div className="space-y-2 pl-4 border-l-2 border-blue-100">
                        <label className="text-xs font-medium text-gray-500">Regreso de Comida</label>
                        <Input type="time" value={entradaComida} onChange={(e) => setEntradaComida(e.target.value)} className="font-mono bg-gray-50" />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2 py-2 border-t border-gray-100 my-2"></div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Margen de Retardo (HH:MM:SS)</label>
                    <Input
                      value={retardo}
                      onChange={(e) => setRetardo(formatTimeInput(e.target.value))}
                      placeholder="00:00:00"
                      className="font-mono bg-gray-50"
                      maxLength={8}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Tiempo de Trabajo (HH:MM:SS)</label>
                    <Input
                      value={tiempoTrabajo}
                      onChange={(e) => setTiempoTrabajo(formatTimeInput(e.target.value))}
                      placeholder="08:00:00"
                      className="font-mono bg-gray-50"
                      maxLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Descuento de Comida (HH:MM:SS)</label>
                    <Input
                      value={descuentoComida}
                      onChange={(e) => setDescuentoComida(formatTimeInput(e.target.value))}
                      placeholder="00:00:00"
                      className="font-mono bg-gray-50"
                      maxLength={8}
                    />
                  </div>

                  <div className="md:col-span-2 p-4 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>En horarios variables, el sistema calculará la asistencia basado en el cumplimiento del tiempo total de trabajo, independientemente de la hora de entrada o salida.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Turnos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Turnos Asociados</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowModalTurnos(true)}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Turno
              </Button>
            </div>

            <div className="p-6">
              {turnosAsociados.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <CalendarOff className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  No hay turnos asignados a este horario.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Debe Marcar Salida</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Inicia Turno al Marcar Entrada</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marcación Opcional</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {turnosAsociados.map((t, index) => {
                        const tname = turnosDisponibles.find(td => td.Oid == t.Shift)?.Nombre || 'Turno ' + t.Shift;
                        return (
                          <tr key={`${t.Shift}-${t.Day}-${index}`}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tname}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{t.Day}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <Checkbox
                                checked={t.MustMarkingOut}
                                onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'MustMarkingOut', checked)}
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <Checkbox
                                checked={t.StartShiftMarkingIn}
                                onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'StartShiftMarkingIn', checked)}
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <Checkbox
                                checked={t.MarkingOptional}
                                onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'MarkingOptional', checked)}
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm" onClick={() => removeTurno(index)} className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-1" /> Quitar
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 z-10">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Crear Horario'}
        </button>
      </div>

      {/* MODAL TURNOS */}
      {showModalTurnos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Agregar Turnos</h3>
              <button onClick={() => setShowModalTurnos(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                <select
                  value={formularioTurno.turnoSeleccionado}
                  onChange={e => handleFormularioChange('turnoSeleccionado', e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                >
                  <option value="">Seleccione...</option>
                  {turnosDisponibles.map(t => <option key={t.Oid} value={t.Oid}>{t.Nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Días</label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map(d => (
                    <button
                      key={d.id} type="button"
                      onClick={() => toggleDiaSeleccionado(d.nombre)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${formularioTurno.diasSeleccionados.includes(d.nombre) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {d.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Checkbox
                    checked={formularioTurno.debeMarcarSalida}
                    onCheckedChange={(checked) => handleFormularioChange('debeMarcarSalida', checked)}
                  />
                  <span className="text-xs font-medium text-gray-700">Debe Marcar Salida</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Checkbox
                    checked={formularioTurno.iniciaTurnoAl}
                    onCheckedChange={(checked) => handleFormularioChange('iniciaTurnoAl', checked)}
                  />
                  <span className="text-xs font-medium text-gray-700">Inicia Turno al Marcar</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Checkbox
                    checked={formularioTurno.marcacionOpcional}
                    onCheckedChange={(checked) => handleFormularioChange('marcacionOpcional', checked)}
                  />
                  <span className="text-xs font-medium text-gray-700">Marcación Opcional</span>
                </label>
              </div>

            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModalTurnos(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancelar</button>
              <button type="button" onClick={agregarTurnoDesdeModal} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm hover:shadow">Confirmar Turnos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}