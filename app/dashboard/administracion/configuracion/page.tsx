'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Save, Clock, Calendar, RefreshCw } from "lucide-react";

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
      try {
        const response = await fetch('/api/configuracion');
        if (!response.ok) throw new Error('Error al cargar configuraciones');
        const data: ConfiguracionGrupo[] = await response.json();
        setConfiguraciones(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Error conectando a la base de datos de configuraciones');
      } finally {
        setCargando(false);
      }
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

  const handleGuardarConfiguraciones = async () => {
    setGuardando(true);
    try {
      // Recolectar todos los items que son editables (tipo 'time')
      const updates: { id: string; valor: string }[] = [];
      configuraciones.forEach(grupo => {
        grupo.configuraciones.forEach(config => {
          updates.push({ id: config.id, valor: config.valor });
        });
      });

      const response = await fetch('/api/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Error al guardar configuraciones');
      alert('Configuraciones guardadas exitosamente');
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      alert('Error al guardar las configuraciones');
    } finally {
      setGuardando(false);
    }
  };

  const renderizarCampo = (config: ConfiguracionItem, grupoId: string) => {
    switch (config.tipo) {
      case 'time':
        return (
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="HH:mm:ss"
              value={config.valor}
              onChange={(e) => handleConfigChange(grupoId, config.id, e.target.value)}
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={config.valor}
            onChange={(e) => handleConfigChange(grupoId, config.id, e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {config.opciones?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      default:
        return (
          <Input
            type="text"
            value={config.valor}
            onChange={(e) => handleConfigChange(grupoId, config.id, e.target.value)}
            className="bg-gray-50 border-gray-300 focus:bg-white"
          />
        );
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Configuración</h1>
            <p className="text-sm text-gray-600 mt-1">
              Administra los parámetros de tiempo del sistema
            </p>
          </div>
        </div>

        <Button
          onClick={handleGuardarConfiguraciones}
          disabled={guardando}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
        >
          {guardando ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Configuraciones */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {configuraciones.map((grupo) => (
          <Card key={grupo.id} className="shadow-sm border border-gray-200 rounded-2xl">
            <CardHeader className="pb-4 border-b border-gray-200 bg-white">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {grupo.nombre}
                <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Recuperable: {grupo.recuperable}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {grupo.configuraciones.map((config) => (
                <div key={config.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {config.nombre}
                  </label>
                  {renderizarCampo(config, grupo.id)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información Adicional */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Información de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Los cambios se aplican inmediatamente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Configuraciones basadas en tiempo 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Recuperable desde respaldo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}