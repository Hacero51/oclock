'use client';
import { useState, useEffect } from 'react';

export default function HorarioFijoForm() {
  // Estados principales
  const [entrada, setEntrada] = useState('06:00');
  const [salida, setSalida] = useState('14:00');
  const [incluirComida, setIncluirComida] = useState(true);
  const [salidaComida, setSalidaComida] = useState('13:00');
  const [entradaComida, setEntradaComida] = useState('13:00');
  const [retardo, setRetardo] = useState('00:00');
  const [nombreHorario, setNombreHorario] = useState('');
  const [tiempoTotal, setTiempoTotal] = useState('08:00:00');
  
  // Estados para turnos y modal
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [showModalTurnos, setShowModalTurnos] = useState(false);
  
  // Estado para el formulario del segundo modal
  const [formularioTurno, setFormularioTurno] = useState({
    // Campos de la primera imagen
    debeMarcarSalida: true,
    iniciaTurnoAl: false,
    marcacionOpcional: false,
    turnoSeleccionado: '',
    diasSeleccionados: []
  });

  // Turnos disponibles basados en la segunda imagen
  const [turnosDisponibles, setTurnosDisponibles] = useState([
    { 
      id: 1, 
      nombre: 'OTCENA', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 2, 
      nombre: 'OTCENA - DITRAS', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 3, 
      nombre: 'OTCENA-CALL4', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 4, 
      nombre: 'OTCENA-CALL4-0DTRAS', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 5, 
      nombre: 'PLANTA', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 6, 
      nombre: 'PLANTA E3PH - 8PN', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 7, 
      nombre: 'PLANTA E2PH - 8DPH', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 8, 
      nombre: 'PLANTA E2PH - 2PPH', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 9, 
      nombre: 'PLANTA 6-AW - 2PPH - AEPENTARA', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 10, 
      nombre: 'PLANTA 6-AW - 4PN', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 11, 
      nombre: 'PLANTA 6-PH - 6-AW', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 12, 
      nombre: 'PLANTA 6-PH - 7AH', 
      tipo: 'Semana',
      memorDeCodes: 1
    },
    { 
      id: 13, 
      nombre: 'PLANTA DITRAS', 
      tipo: 'Semana',
      memorDeCodes: 1
    }
  ]);

  // Días de la semana
  const diasSemana = [
    { id: 1, nombre: 'LUNES' },
    { id: 2, nombre: 'MARTES' },
    { id: 3, nombre: 'MIÉRCOLES' },
    { id: 4, nombre: 'JUEVES' },
    { id: 5, nombre: 'VIERNES' },
    { id: 6, nombre: 'SÁBADO' },
    { id: 7, nombre: 'DOMINGO' }
  ];

  // Convertir hora militar a formato normal
  const militarANormal = (horaMilitar) => {
    const [horas, minutos] = horaMilitar.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  };

  // Calcular tiempo total
  const calcularTiempoTotal = () => {
    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
    const [hSalida, mSalida] = salida.split(':').map(Number);
    
    let totalMinutos = (hSalida * 60 + mSalida) - (hEntrada * 60 + mEntrada);
    
    if (incluirComida) {
      const [hSalidaComida, mSalidaComida] = salidaComida.split(':').map(Number);
      const [hEntradaComida, mEntradaComida] = entradaComida.split(':').map(Number);
      const minutosComida = (hEntradaComida * 60 + mEntradaComida) - (hSalidaComida * 60 + mSalidaComida);
      totalMinutos -= minutosComida;
    }
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;
  };

  // Generar nombre del horario
  const generarNombreHorario = () => {
    const entradaNormal = militarANormal(entrada);
    const salidaNormal = militarANormal(salida);
    return `${entradaNormal} A ${salidaNormal}`;
  };

  // Efectos para cálculos automáticos
  useEffect(() => {
    setTiempoTotal(calcularTiempoTotal());
    setNombreHorario(generarNombreHorario());
  }, [entrada, salida, incluirComida, salidaComida, entradaComida]);

  // Manejar selección de turnos en la tabla principal
  const toggleTurno = (turnoId, dia) => {
    const turnoKey = `${turnoId}-${dia}`;
    setTurnosSeleccionados(prev => 
      prev.includes(turnoKey) 
        ? prev.filter(t => t !== turnoKey)
        : [...prev, turnoKey]
    );
  };

  // Manejar cambios en el formulario del modal
  const handleFormularioChange = (field, value) => {
    setFormularioTurno(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar selección de días en el modal
  const toggleDiaSeleccionado = (dia) => {
    setFormularioTurno(prev => ({
      ...prev,
      diasSeleccionados: prev.diasSeleccionados.includes(dia)
        ? prev.diasSeleccionados.filter(d => d !== dia)
        : [...prev.diasSeleccionados, dia]
    }));
  };

  // Agregar turno desde el modal
  const agregarTurnoDesdeModal = () => {
    if (!formularioTurno.turnoSeleccionado || formularioTurno.diasSeleccionados.length === 0) {
      alert('Por favor seleccione un turno y al menos un día');
      return;
    }

    // Agregar los turnos seleccionados a la tabla principal
    const nuevosTurnos = formularioTurno.diasSeleccionados.map(dia => {
      const turnoKey = `${formularioTurno.turnoSeleccionado}-${dia}`;
      return turnoKey;
    });

    setTurnosSeleccionados(prev => [...prev, ...nuevosTurnos]);
    
    // Resetear formulario y cerrar modal
    setFormularioTurno({
      debeMarcarSalida: true,
      iniciaTurnoAl: false,
      marcacionOpcional: false,
      turnoSeleccionado: '',
      diasSeleccionados: []
    });
    setShowModalTurnos(false);
  };

  // Enviar formulario principal
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const horarioData = {
      nombre: nombreHorario,
      tiempoTotal,
      entrada,
      salida,
      retardo,
      incluirComida,
      salidaComida: incluirComida ? salidaComida : null,
      entradaComida: incluirComida ? entradaComida : null,
      turnos: turnosSeleccionados
    };
    
    console.log('Datos del horario:', horarioData);
    alert('Horario guardado exitosamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">Formulario de Horario Fijo</h1>
          <p className="text-blue-100">Gestión de horarios laborales y turnos</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Resumen del Horario */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Resumen del Horario</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nombre:</span>
                <span className="ml-2">{nombreHorario}</span>
              </div>
              <div>
                <span className="font-medium">Tiempo Total:</span>
                <span className="ml-2">{tiempoTotal}</span>
              </div>
            </div>
          </div>

          {/* Configuración de Horario */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Configuración de Horario</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Entrada
                </label>
                <input
                  type="time"
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Salida
                </label>
                <input
                  type="time"
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Tiempo de Comida */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={incluirComida}
                  onChange={(e) => setIncluirComida(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Incluir tiempo de comida</span>
              </label>
            </div>

            {incluirComida && (
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salida de Comida
                  </label>
                  <input
                    type="time"
                    value={salidaComida}
                    onChange={(e) => setSalidaComida(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entrada de Comida
                  </label>
                  <input
                    type="time"
                    value={entradaComida}
                    onChange={(e) => setEntradaComida(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retardo
              </label>
              <input
                type="time"
                value={retardo}
                onChange={(e) => setRetardo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Banner Turnos Horario */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Turnos Horario</h3>
                    <p className="text-blue-100 text-sm">Gestión de turnos asociados al horario</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModalTurnos(true)}
                  className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Turnos */}
          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 border-b text-left">Turno</th>
                    <th className="py-3 px-4 border-b text-left">Día</th>
                    <th className="py-3 px-4 border-b text-center">Debe Marcar Salida</th>
                    <th className="py-3 px-4 border-b text-center">Inicia el Turno al</th>
                    <th className="py-3 px-4 border-b text-center">Marcación Opcional</th>
                    <th className="py-3 px-4 border-b text-center">Seleccionar</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosSeleccionados.map((turnoKey) => {
                    const [turnoId, dia] = turnoKey.split('-');
                    const turno = turnosDisponibles.find(t => t.id === parseInt(turnoId));
                    
                    if (!turno) return null;
                    
                    return (
                      <tr key={turnoKey} className="hover:bg-gray-50 border-b">
                        <td className="py-3 px-4">{turno.nombre}</td>
                        <td className="py-3 px-4">{dia}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={formularioTurno.debeMarcarSalida}
                            readOnly
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={formularioTurno.iniciaTurnoAl}
                            readOnly
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={formularioTurno.marcacionOpcional}
                            readOnly
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Guardar Horario
            </button>
          </div>
        </form>

        {/* Segundo Modal - Con campos de la primera imagen */}
        {showModalTurnos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Agregar Turnos al Horario</h3>
                <button
                  onClick={() => setShowModalTurnos(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Selección de Turno Existente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Turno Existente
                  </label>
                  <select
                    value={formularioTurno.turnoSeleccionado}
                    onChange={(e) => handleFormularioChange('turnoSeleccionado', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un turno</option>
                    {turnosDisponibles.map((turno) => (
                      <option key={turno.id} value={turno.id}>
                        {turno.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Días de la Semana */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Días de la Semana
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {diasSemana.map((dia) => (
                      <label key={dia.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formularioTurno.diasSeleccionados.includes(dia.nombre)}
                          onChange={() => toggleDiaSeleccionado(dia.nombre)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">{dia.id} {dia.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Configuraciones del Turno - Basado en la primera imagen */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-700">Configuraciones del Turno</h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formularioTurno.debeMarcarSalida}
                      onChange={(e) => handleFormularioChange('debeMarcarSalida', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Debe Marcar Salida</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formularioTurno.iniciaTurnoAl}
                      onChange={(e) => handleFormularioChange('iniciaTurnoAl', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Inicia el Turno al</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formularioTurno.marcacionOpcional}
                      onChange={(e) => handleFormularioChange('marcacionOpcional', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Marcación Opcional</span>
                  </label>
                </div>

                {/* Vista Previa */}
                {formularioTurno.turnoSeleccionado && formularioTurno.diasSeleccionados.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">Vista Previa</h4>
                    <p className="text-sm text-blue-600">
                      Se agregará el turno "{turnosDisponibles.find(t => t.id === parseInt(formularioTurno.turnoSeleccionado))?.nombre}" 
                      para los días: {formularioTurno.diasSeleccionados.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModalTurnos(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={agregarTurnoDesdeModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agregar al Horario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}