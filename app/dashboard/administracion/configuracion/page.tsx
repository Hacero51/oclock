'use client';

import React, { useState, useEffect } from 'react';

interface ConfiguracionGrupo {
  id: string;
  nombre: string;
  recuperable: number;
  configuraciones: ConfiguracionItem[];
}

interface ConfiguracionItem {
  id: string;
  nombre: string;
  valor: string;
  tipo: 'time' | 'number' | 'boolean' | 'select';
  opciones?: string[];
}

export default function PanelConfiguracionAdmin() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionGrupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cargar configuraciones iniciales
  useEffect(() => {
    const cargarConfiguraciones = async () => {
      setCargando(true);
      
      // Simular carga de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const datosIniciales: ConfiguracionGrupo[] = [
        {
          id: 'grupo-Asistencia',
          nombre: 'Grupo Asistencia',
          recuperable: 4,
          configuraciones: [
            {
              id: 'tiempo-minimo-entrada',
              nombre: 'Tempo minivo entre marcaciones de entrada',
              valor: '00:30:00',
              tipo: 'time'
            },
            {
              id: 'tiempo-minimo-salida',
              nombre: 'Tempo minivo entre marcaciones de salida',
              valor: '00:30:00',
              tipo: 'time'
            },
            {
              id: 'valor-minimo-dia',
              nombre: 'Valor minimo de horas por dia',
              valor: '01:00:00',
              tipo: 'time'
            },
            {
              id: 'tiempo-corregir-navegador',
              nombre: 'Tempo minivo para corregir marcacion',
              valor: '02:00:00',
              tipo: 'time'
            }
          ]
        },
        {
          id: 'grupo-pre-nomina',
          nombre: 'Grupo Pre-Nomina',
          recuperable: 5,
          configuraciones: [
            {
              id: 'ajuste-tiempo',
              nombre: 'Ajuste de tiempo',
              valor: '03:00:00',
              tipo: 'time'
            },
            {
              id: 'ajuste-concepto',
              nombre: 'Ajuste tiempo por concreto',
              valor: '00:30:00',
              tipo: 'time'
            },
            {
              id: 'tiempo-exportacion',
              nombre: 'Tiempo minino de exportación por concepto',
              valor: '01:00:00',
              tipo: 'time'
            },
            {
              id: 'inicio-jornada',
              nombre: 'Note de jornada nocturna',
              valor: '08:00:00',
              tipo: 'time'
            },
            {
              id: 'fin-jornada',
              nombre: 'Fin de jornada nocturna',
              valor: '17:00:00',
              tipo: 'time'
            }
          ]
        }
      ];

      setConfiguraciones(datosIniciales);
      setCargando(false);
    };

    cargarConfiguraciones();
  }, []);

  const handleConfigChange = (grupoId: string, configId: string, nuevoValor: string) => {
    setConfiguraciones(prev => 
      prev.map(grupo => 
        grupo.id === grupoId 
          ? {
              ...grupo,
              configuraciones: grupo.configuraciones.map(config =>
                config.id === configId ? { ...config, valor: nuevoValor } : config
              )
            }
          : grupo
      )
    );
  };

  const renderizarCampo = (config: ConfiguracionItem, grupoId: string) => {
    switch (config.tipo) {
      case 'time':
        return (
          <input
            type="time"
            step="1"
            value={config.valor}
            onChange={(e) => handleConfigChange(grupoId, config.id, e.target.value + ':00')}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={config.valor}
            onChange={(e) => handleConfigChange(grupoId, config.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">⚙️ Panel de Configuración</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Administra los Parámetros de Tiempo del Sistema</p>
            </div>
          </div>

          {/* Tabla Principal - Versión Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-1/3">
                    Grupo
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-1/3">
                    Configuración
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-1/4">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {configuraciones.map((grupo, grupoIndex) => (
                  <React.Fragment key={grupo.id}>
                    {/* Fila de Grupo */}
                    <tr className="bg-blue-50">
                      <td className="border border-gray-200 p-3 font-semibold text-blue-800">
                        {grupo.nombre}
                      </td>
                      <td className="border border-gray-200 p-3 text-sm text-gray-600">
                        Grupo de configuraciones
                      </td>
                      <td className="border border-gray-200 p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Recuperable: {grupo.recuperable}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Configuraciones del grupo */}
                    {grupo.configuraciones.map((config) => (
                      <tr 
                        key={config.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border border-gray-200 p-3 text-sm text-gray-500">
                          {/* Espacio en blanco para alineación */}
                        </td>
                        <td className="border border-gray-200 p-3 text-sm text-gray-700">
                          {config.nombre}
                        </td>
                        <td className="border border-gray-200 p-3">
                          <div className="w-32">
                            {renderizarCampo(config, grupo.id)}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Separador entre grupos */}
                    {grupoIndex < configuraciones.length - 1 && (
                      <tr>
                        <td colSpan={3} className="border border-gray-200 p-2 bg-gray-100">
                          <div className="h-px bg-gray-300"></div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versión Mobile/Tablet */}
          <div className="lg:hidden space-y-4">
            {configuraciones.map((grupo) => (
              <div key={grupo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header del Grupo Mobile */}
                <div className="bg-blue-50 p-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-blue-800 text-sm">{grupo.nombre}</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      Recuperable: {grupo.recuperable}
                    </span>
                  </div>
                </div>
                
                {/* Configuraciones Mobile */}
                <div className="divide-y divide-gray-200">
                  {grupo.configuraciones.map((config) => (
                    <div key={config.id} className="p-3 hover:bg-gray-50">
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {config.nombre}
                        </label>
                        <div className="w-full">
                          {renderizarCampo(config, grupo.id)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}