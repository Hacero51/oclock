'use client';
import { useState, useEffect } from 'react';
import { Clock, X, Settings, AlertTriangle, CalendarDays, Plus, Trash2, CalendarOff, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';

export default function UpdateHorariosForm({ data, onClose }) {
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
  const [tiempoTotal, setTiempoTotal] = useState('00:00:00');
  const [headerName, setHeaderName] = useState('');

  // State refactored to store objects instead of strings
  const [turnosAsociados, setTurnosAsociados] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // FETCH DATA
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch Horario Details (always fetch to get relations like Turnos)
        let dataDetails = data;
        const targetOid = data?.Oid?.trim();

        if (targetOid) {
          const resDetail = await fetch(`/api/horarios/${targetOid}`);
          if (resDetail.ok) {
            dataDetails = await resDetail.json();
          }
        }

        // Populate Form with Data
        if (dataDetails) {
          setNombreHorario(dataDetails.Name || dataDetails.DisplayName || '');
          setTipoHorario(dataDetails.type?.toLowerCase() || 'fijo');
          setEntrada(dataDetails.entrada?.substring(0, 5) || '09:00');
          setSalida(dataDetails.salida?.substring(0, 5) || '18:00');
          setIncluirComida(dataDetails.incluirComida || false);
          setSalidaComida(dataDetails.salidaComida?.substring(0, 5) || '14:00');
          setEntradaComida(dataDetails.entradaComida?.substring(0, 5) || '15:00');
          setRetardo(dataDetails.retardo || '00:00:00');
          setTiempoTrabajo(dataDetails.tiempoTrabajo || '08:00:00');
          setDescuentoComida(dataDetails.descuentoComida || '00:00:00');

          // Populate Turnos Asociados (Objects)
          if (dataDetails.turnos && Array.isArray(dataDetails.turnos)) {
            const mappedTurnos = dataDetails.turnos.map(t => ({
              Shift: t.Shift?.trim(), // This refers to the Shift OID
              Day: t.Day,
              MustMarkingOut: t.MustMarkingOut ?? true,
              StartShiftMarkingIn: t.StartShiftMarkingIn ?? false,
              MarkingOptional: t.MarkingOptional ?? false
            }));
            setTurnosAsociados(mappedTurnos);
          }
        }

        // 2. Fetch Turnos Disponibles
        const resTurnos = await fetch('/api/turnos');
        const dataTurnos = await resTurnos.json();
        setTurnosDisponibles(dataTurnos);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    fetchData();
  }, [data]);

  // Helper para convertir segundos
  const secondsToTime = (val) => {
    if (typeof val === 'string') return val;
    if (!val) return '00:00';
    const h = Math.floor(val / 3600).toString().padStart(2, '0');
    const m = Math.floor((val % 3600) / 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  const normalizarDuracion = (value) => {
    if (!value) return '00:00:00';
    const partes = value.split(':').map(v => v.replace(/\D/g, ''));
    let h = partes[0] || '00';
    let m = partes[1] || '00';
    let s = partes[2] || '00';
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
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

  const formatTimeInput = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Format as HH:MM:SS as user types
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
  };


  // Cálculos automáticos
  const militarANormal = (horaMilitar) => {
    if (!horaMilitar) return '';
    const [horas, minutos] = horaMilitar.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  };

  const calcularTiempoTotalFijo = () => {
    if (!entrada || !salida) return '00:00:00';
    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
    const [hSalida, mSalida] = salida.split(':').map(Number);
    let totalMinutos = (hSalida * 60 + mSalida) - (hEntrada * 60 + mEntrada);

    if (incluirComida && salidaComida && entradaComida) {
      const [hSalidaComida, mSalidaComida] = salidaComida.split(':').map(Number);
      const [hEntradaComida, mEntradaComida] = entradaComida.split(':').map(Number);
      const minutosComida = (hEntradaComida * 60 + mEntradaComida) - (hSalidaComida * 60 + mSalidaComida);
      totalMinutos -= minutosComida;
    }
    // Handle Next Day cases if needed (not simple here without dates, assuming same day for now)
    if (totalMinutos < 0) totalMinutos += 24 * 60;

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;
  };

  useEffect(() => {
    if (loading) return;

    if (tipoHorario === 'fijo') {
      const total = calcularTiempoTotalFijo();
      setTiempoTotal(total);

      let nombre = `${militarANormal(entrada)} A ${militarANormal(salida)}`;
      if (incluirComida) {
        nombre += ` CON ALMUERZO DE ${militarANormal(salidaComida)} A ${militarANormal(entradaComida)}`;
      }
      setNombreHorario(nombre);
      setHeaderName(nombre);

    } else if (tipoHorario === 'variable') {
      const trabajoSeg = durationToSeconds(tiempoTrabajo);
      const descuentoSeg = durationToSeconds(descuentoComida);
      const totalSeg = Math.max(trabajoSeg - descuentoSeg, 0);

      setTiempoTotal(secondsToDuration(totalSeg));

      // Visual Update
      const [horas, minutos] = tiempoTrabajo.split(':').map(Number);

      const turnosUnicos = new Set(turnosAsociados.map(t => t.Day));
      const tieneUnSoloDia = turnosUnicos.size === 1;
      const dia = tieneUnSoloDia ? Array.from(turnosUnicos)[0] : '';
      const horasTexto = `${horas || 0} HORA${horas !== 1 ? 'S' : ''}`;
      const minText = minutos > 0 ? ` ${minutos} MIN` : '';

      // 1. Generate Short Name
      let shortName = '';
      if (tieneUnSoloDia && dia) {
        shortName = `${dia.toUpperCase()} ${horasTexto}${minText} : ${tiempoTrabajo}`;
      } else {
        shortName = `${horasTexto}${minText} : ${tiempoTrabajo}`;
      }
      setNombreHorario(shortName);

      // 2. Generate Long Name
      let longName = shortName;
      if (descuentoSeg > 0 && entrada && salida) {
        longName = `${militarANormal(entrada)} A ${militarANormal(salida)} : ${tiempoTrabajo} (DESCUENTO DEL TIEMPO DE COMIDA : ${descuentoComida})`;
      }
      setHeaderName(longName);
    }
  }, [entrada, salida, incluirComida, salidaComida, entradaComida, tipoHorario, tiempoTrabajo, descuentoComida, turnosAsociados, loading]);


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

    // Evitar duplicados si es necesario, por simplicidad agregamos
    // Pero si ya existe Shift+Day, lo sobrescribimos o ignoramos?
    // Mejor filtrar duplicados exactos
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
    if (loading) return;

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
      const targetOid = data?.Oid?.trim();
      const res = await fetch(`/api/horarios/${targetOid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Horario actualizado correctamente');
        if (onClose) onClose();
      } else {
        alert('Error al guardar cambios');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50/50 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-3 md:px-8 py-3 md:py-6 border-b-2 md:border-b-4 border-indigo-800 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-r  rounded-xl shadow-lg shadow-blue-600/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white-500 tracking-tight">Actualizar Horario</h2>
            <p className="text-sm text-white-500 font-medium">
              {headerName || 'Cargando detalles...'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600 active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Cargando información...</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">

            {/* INFO CARD */}
            <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Nombre del Horario</label>
                  <Input
                    value={nombreHorario}
                    onChange={(e) => setNombreHorario(e.target.value)}
                    placeholder="Ej: Administrativo Diurno"
                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base px-4 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Tipo de Horario</label>
                  <div className="flex items-center h-12 px-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 font-bold tracking-wide uppercase">
                    {tipoHorario}
                  </div>
                </div>
              </div>
            </div>

            {/* CONFIG CARD */}
            <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Decorators */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 relative z-10">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configuración {tipoHorario === 'fijo' ? 'Fija' : 'Variable'}</h3>
                  <p className="text-xs text-gray-500">Ajuste los parámetros de tiempo y tolerancia</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                {tipoHorario === 'fijo' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Hora de Entrada</label>
                      <Input type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="h-8 text-lg bg-gray-50 border-gray-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Hora de Salida</label>
                      <Input type="time" value={salida} onChange={(e) => setSalida(e.target.value)} className="h-8 text-lg bg-gray-50 border-gray-200 rounded-xl" />
                    </div>

                    <div className="md:col-span-2 py-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="space-y-1">
                          <span className="text-base font-semibold text-gray-900 block">Tiempo de Comida</span>
                          <span className="text-xs text-gray-500">¿El horario incluye descanso intermedio?</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={incluirComida} onChange={(e) => setIncluirComida(e.target.checked)} />
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {incluirComida && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-blue-900">Salida a Comida</label>
                          <Input type="time" value={salidaComida} onChange={(e) => setSalidaComida(e.target.value)} className="h-11 font-mono text-lg bg-white border-blue-200 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-blue-900">Regreso de Comida</label>
                          <Input type="time" value={entradaComida} onChange={(e) => setEntradaComida(e.target.value)} className="h-11 font-mono text-lg bg-white border-blue-200 rounded-xl" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium text-gray-600">Margen de Retardo</label>
                      <Input
                        value={retardo}
                        onChange={(e) => setRetardo(formatTimeInput(e.target.value))}
                        placeholder="HH:MM:SS"
                        className="h-8 text-lg bg-gray-50 border-gray-200 rounded-xl"
                        maxLength={8}
                      />
                      <p className="text-xs text-gray-400">Tolerancia permitida antes de marcar retardo</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Tiempo de Trabajo</label>
                      <Input
                        value={tiempoTrabajo}
                        onChange={(e) => setTiempoTrabajo(formatTimeInput(e.target.value))}
                        placeholder="08:00:00"
                        className="h-8 text-lg bg-gray-50 border-gray-200 rounded-xl"
                        maxLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Descuento Comida</label>
                      <Input
                        value={descuentoComida}
                        onChange={(e) => setDescuentoComida(formatTimeInput(e.target.value))}
                        placeholder="00:00:00"
                        className="h-8 text-lg bg-gray-50 border-gray-200 rounded-xl"
                        maxLength={8}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* TURNOS CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-white px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Turnos Asociados</h3>
                    <p className="text-xs text-gray-500">{turnosAsociados.length} turno(s) configurado(s)</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowModalTurnos(true)}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar Turno
                </Button>
              </div>

              <div className="p-0">
                {turnosAsociados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50/50">
                    <CalendarOff className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No hay turnos asignados</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* RESPONSIVE TABLE / CARDS */}
                    <div className="hidden md:block">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Turno</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Día</th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Salida</th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Inicia</th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Opcional</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                          {turnosAsociados.map((t, index) => {
                            const trimmedShiftOid = t.Shift?.trim();
                            const tname = turnosDisponibles.find(td => td.Oid?.trim() === trimmedShiftOid)?.Nombre || 'Turno ' + t.Shift;
                            return (
                              <tr key={`${t.Shift}-${t.Day}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{tname}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-extrabold">{t.Day}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <Checkbox checked={t.MustMarkingOut} onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'MustMarkingOut', checked)} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <Checkbox checked={t.StartShiftMarkingIn} onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'StartShiftMarkingIn', checked)} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <Checkbox checked={t.MarkingOptional} onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'MarkingOptional', checked)} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button onClick={() => removeTurno(index)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE CARDS VIEW */}
                    <div className="md:hidden space-y-4 p-4 bg-gray-50">
                      {turnosAsociados.map((t, index) => {
                        const trimmedShiftOid = t.Shift?.trim();
                        const tname = turnosDisponibles.find(td => td.Oid?.trim() === trimmedShiftOid)?.Nombre || 'Turno ' + t.Shift;
                        return (
                          <div key={`${t.Shift}-${t.Day}-${index}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-gray-900">{tname}</h4>
                                <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600">{t.Day}</span>
                              </div>
                              <button onClick={() => removeTurno(index)} className="p-2 text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Salida</span>
                                <Checkbox checked={t.MustMarkingOut} onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'MustMarkingOut', checked)} />
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Inicia</span>
                                <Checkbox checked={t.StartShiftMarkingIn} onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'StartShiftMarkingIn', checked)} />
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Opcional</span>
                                <Checkbox checked={t.MarkingOptional} onCheckedChange={(checked) => handleUpdateTurnoFlag(index, 'MarkingOptional', checked)} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>
            </div>
            {/* SPACING PADDING BOTTOM */}
            <div className="h-20"></div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors active:scale-95"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95"
        >
          Guardar Cambios
        </button>
      </div>

      {/* MODAL TURNOS*/}
      {showModalTurnos && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-3 md:px-8 py-3 md:py-6 border-b-2 md:border-b-4 border-indigo-800 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-xl shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Agregar Turnos</h3>
                  <p className="text-xs text-indigo-100 font-medium opacity-90">Seleccione los días y el turno base</p>
                </div>
              </div>
              <button
                onClick={() => setShowModalTurnos(false)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider">Seleccionar Turno Base</label>
                <div className="relative group">
                  <select
                    value={formularioTurno.turnoSeleccionado}
                    onChange={e => handleFormularioChange('turnoSeleccionado', e.target.value)}
                    className="w-full h-11 px-4 border border-blue-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium appearance-none"
                  >
                    <option value="">Seleccione un turno...</option>
                    {turnosDisponibles.map(t => <option key={t.Oid?.trim()} value={t.Oid?.trim()}>{t.Nombre}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider">Días de Aplicación</label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map(d => (
                    <button
                      key={d.id} type="button"
                      onClick={() => toggleDiaSeleccionado(d.nombre)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all shadow-sm active:scale-95 uppercase tracking-wide ${formularioTurno.diasSeleccionados.includes(d.nombre)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-white border-blue-200 text-gray-600 hover:bg-gray-50 hover:border-indigo-300'}`}
                    >
                      {d.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Debe Marcar Salida', field: 'debeMarcarSalida' },
                  { label: 'Inicia Turno al Marcar', field: 'iniciaTurnoAl' },
                  { label: 'Marcación Opcional', field: 'marcacionOpcional' }
                ].map((opt) => (
                  <label key={opt.field} className={`flex flex-col items-center justify-center gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all active:scale-95 ${formularioTurno[opt.field]
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-blue-100 bg-white hover:border-indigo-200 hover:bg-gray-50'}`}>
                    <Checkbox
                      checked={formularioTurno[opt.field]}
                      onCheckedChange={(checked) => handleFormularioChange(opt.field, checked)}
                      className={`w-6 h-6 border-2 transition-transform ${formularioTurno[opt.field] ? 'scale-110' : ''}`}
                    />
                    <span className={`text-[10px] font-black leading-tight text-center uppercase tracking-widest transition-colors ${formularioTurno[opt.field] ? 'text-indigo-800' : 'text-gray-500'}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setShowModalTurnos(false)}
                className="px-6 py-3 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-xl font-bold text-sm transition-all"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={agregarTurnoDesdeModal}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 font-bold text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Confirmar y Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}