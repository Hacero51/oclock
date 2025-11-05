'use client';
import { useState, useEffect } from 'react';

export default function FormularioMarcacion() {
  // Estados del formulario
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [fecha, setFecha] = useState('');
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [estado, setEstado] = useState('completo');
  const [showBuscador, setShowBuscador] = useState(false);

  // Estado para empleados (datos de ejemplo)
  const [empleados, setEmpleados] = useState([
    {
      id: 1,
      numeroLector: '001',
      documento: '12345678',
      nombreCompleto: 'Juan Pérez García',
      cargo: 'Analista de Sistemas',
      departamento: 'TI'
    },
    {
      id: 2,
      numeroLector: '002',
      documento: '87654321',
      nombreCompleto: 'María López Hernández',
      cargo: 'Supervisor de Producción',
      departamento: 'Producción'
    },
    {
      id: 3,
      numeroLector: '003',
      documento: '11223344',
      nombreCompleto: 'Carlos Rodríguez Martínez',
      cargo: 'Asistente Administrativo',
      departamento: 'Administración'
    },
    {
      id: 4,
      numeroLector: '004',
      documento: '44332211',
      nombreCompleto: 'Ana García Silva',
      cargo: 'Jefe de Turno',
      departamento: 'Operaciones'
    },
    {
      id: 5,
      numeroLector: '005',
      documento: '55667788',
      nombreCompleto: 'Pedro Sánchez Vargas',
      cargo: 'Técnico Especializado',
      departamento: 'Mantenimiento'
    }
  ]);

  // Estado para empleados filtrados
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  // Formatear fecha actual como valor por defecto
  useEffect(() => {
    const ahora = new Date();
    const fechaFormateada = ahora.toISOString().split('T')[0];
    setFecha(fechaFormateada);
    
    // Formatear hora actual
    const hora = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    setEntrada(`${hora}:${minutos}`);
  }, []);

  // Filtrar empleados según búsqueda
  useEffect(() => {
    if (busquedaEmpleado.trim() === '') {
      setEmpleadosFiltrados([]);
      return;
    }

    const filtrados = empleados.filter(emp =>
      emp.numeroLector.toLowerCase().includes(busquedaEmpleado.toLowerCase()) ||
      emp.documento.toLowerCase().includes(busquedaEmpleado.toLowerCase()) ||
      emp.nombreCompleto.toLowerCase().includes(busquedaEmpleado.toLowerCase()) ||
      emp.cargo.toLowerCase().includes(busquedaEmpleado.toLowerCase()) ||
      emp.departamento.toLowerCase().includes(busquedaEmpleado.toLowerCase())
    );
    setEmpleadosFiltrados(filtrados);
  }, [busquedaEmpleado, empleados]);

  // Seleccionar empleado
  const seleccionarEmpleado = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setBusquedaEmpleado(empleado.nombreCompleto);
    setShowBuscador(false);
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    
    const fechaObj = new Date(fechaStr);
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  };

  // Convertir hora militar a formato AM/PM
  const militarANormal = (horaMilitar) => {
    if (!horaMilitar) return '';
    
    const [horas, minutos] = horaMilitar.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'p. m.' : 'a. m.';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!empleadoSeleccionado) {
      alert('Por favor seleccione un empleado');
      return;
    }

    const datosMarcacion = {
      empleado: empleadoSeleccionado,
      fecha: formatearFecha(fecha),
      entrada: militarANormal(entrada),
      salida: militarANormal(salida),
      estado
    };

    console.log('Datos de marcación:', datosMarcacion);
    alert('Marcación registrada exitosamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">Formulario de Marcación</h1>
          <p className="text-blue-100">Registro de asistencia y control de horarios</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Campo Empleado con Buscador */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <div className="relative">
              <input
                type="text"
                value={busquedaEmpleado}
                onChange={(e) => {
                  setBusquedaEmpleado(e.target.value);
                  setShowBuscador(true);
                }}
                onFocus={() => setShowBuscador(true)}
                placeholder="Buscar por nombre, documento, número lector, cargo o departamento..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
              
              {/* Lista de resultados de búsqueda */}
              {showBuscador && empleadosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {empleadosFiltrados.map((empleado) => (
                    <div
                      key={empleado.id}
                      onClick={() => seleccionarEmpleado(empleado)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      <div className="font-medium text-gray-900">{empleado.nombreCompleto}</div>
                      <div className="text-sm text-gray-600">
                        <span>N° Lector: {empleado.numeroLector}</span>
                        {' | '}
                        <span>Doc: {empleado.documento}</span>
                        {' | '}
                        <span>{empleado.cargo}</span>
                        {' | '}
                        <span>{empleado.departamento}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información del empleado seleccionado */}
            {empleadoSeleccionado && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span>
                    <span className="ml-2">{empleadoSeleccionado.nombreCompleto}</span>
                  </div>
                  <div>
                    <span className="font-medium">N° Lector:</span>
                    <span className="ml-2">{empleadoSeleccionado.numeroLector}</span>
                  </div>
                  <div>
                    <span className="font-medium">Documento:</span>
                    <span className="ml-2">{empleadoSeleccionado.documento}</span>
                  </div>
                  <div>
                    <span className="font-medium">Cargo:</span>
                    <span className="ml-2">{empleadoSeleccionado.cargo}</span>
                  </div>
                  <div>
                    <span className="font-medium">Departamento:</span>
                    <span className="ml-2">{empleadoSeleccionado.departamento}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campos de Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Campo Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {fecha && (
                <div className="mt-1 text-sm text-gray-500">
                  {formatearFecha(fecha)}
                </div>
              )}
            </div>

            {/* Campo Entrada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Entrada *
              </label>
              <input
                type="time"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {entrada && (
                <div className="mt-1 text-sm text-gray-500">
                  {militarANormal(entrada)}
                </div>
              )}
            </div>

            {/* Campo Salida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Salida
              </label>
              <input
                type="time"
                value={salida}
                onChange={(e) => setSalida(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {salida && (
                <div className="mt-1 text-sm text-gray-500">
                  {militarANormal(salida)}
                </div>
              )}
            </div>
          </div>

          {/* Campo Estado */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="completo">Completo</option>
              <option value="incompleto">Incompleto</option>
            </select>
          </div>

          {/* Sección de Configuraciones Adicionales */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Configuraciones Adicionales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tiempo Extra Después de la Jornada</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tiempo Extra en Festivo</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Marcación Normal</span>
                </label>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Ausencia Justificada</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Licencia</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Vacaciones</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resumen de la Marcación */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Resumen de la Marcación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Empleado:</span>
                <span className="ml-2">{empleadoSeleccionado ? empleadoSeleccionado.nombreCompleto : 'No seleccionado'}</span>
              </div>
              <div>
                <span className="font-medium">Fecha:</span>
                <span className="ml-2">{formatearFecha(fecha)}</span>
              </div>
              <div>
                <span className="font-medium">Entrada:</span>
                <span className="ml-2">{militarANormal(entrada)}</span>
              </div>
              <div>
                <span className="font-medium">Salida:</span>
                <span className="ml-2">{militarANormal(salida)}</span>
              </div>
              <div>
                <span className="font-medium">Estado:</span>
                <span className="ml-2 capitalize">{estado}</span>
              </div>
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
              Registrar Marcación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}