'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Calendar, Plus, Save, Edit, Trash2, FileText } from "lucide-react";
import Tabla from "@/components/Table";

interface DiaFestivo {
  id?: string;
  dia: string;        // Formato: "LUNES, 25 DE DICIEMBRE DE 2025"
  nombre: string;
  estado: string;
  fecha: string;      // Formato: "2025-12-25" para ordenamiento
}

// 🔧 CONFIGURACIÓN API
const API_URLS = {
  DIAS_FESTIVOS: '/api/dias-festivos'
};

export default function DiasFestivosPage() {
  const [diasFestivos, setDiasFestivos] = useState<DiaFestivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<DiaFestivo | null>(null);
  const [filtroAnio, setFiltroAnio] = useState('2025');

  // 📝 DATOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    estado: 'Activo'
  });

  // 📡 FUNCIONES API
  const fetchDiasFestivos = async (): Promise<DiaFestivo[]> => {
    try {
      const response = await fetch(API_URLS.DIAS_FESTIVOS);
      if (!response.ok) throw new Error('Error al cargar días festivos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching días festivos:', error);
      // Datos de ejemplo iniciales
      return [
        { id: '1', dia: "JUEVES, 25 DE DICIEMBRE DE 2025", nombre: "NAVIDAD", estado: "Activo", fecha: "2025-12-25" },
        { id: '2', dia: "LUNES, 8 DE DICIEMBRE DE 2025", nombre: "INMACULADA CONCEPCIÓN", estado: "Activo", fecha: "2025-12-08" },
        { id: '3', dia: "LUNES, 17 DE NOVIEMBRE DE 2025", nombre: "INDEPENDENCIA DE CARTAGENA", estado: "Activo", fecha: "2025-11-17" },
        { id: '4', dia: "LUNES, 3 DE NOVIEMBRE DE 2025", nombre: "DÍA DE TODOS LOS SANTOS", estado: "Activo", fecha: "2025-11-03" },
        { id: '5', dia: "LUNES, 13 DE OCTUBRE DE 2025", nombre: "DÍA DE LA RAZA", estado: "Activo", fecha: "2025-10-13" },
        { id: '6', dia: "LUNES, 18 DE AGOSTO DE 2025", nombre: "LA ASUNCIÓN DE LA VIRGEN", estado: "Activo", fecha: "2025-08-18" },
        { id: '7', dia: "JUEVES, 7 DE AGOSTO DE 2025", nombre: "BATALLA DE BOYACÁ", estado: "Activo", fecha: "2025-08-07" },
        { id: '8', dia: "LUNES, 30 DE JUNIO DE 2025", nombre: "SAN PEDRO Y SAN PABLO", estado: "Activo", fecha: "2025-06-30" },
        { id: '9', dia: "LUNES, 23 DE JUNIO DE 2025", nombre: "CORPUS CHRISTI", estado: "Activo", fecha: "2025-06-23" },
        { id: '10', dia: "LUNES, 2 DE JUNIO DE 2025", nombre: "DÍA DE LA ASCENSIÓN", estado: "Activo", fecha: "2025-06-02" },
        { id: '11', dia: "JUEVES, 1 DE MAYO DE 2025", nombre: "DÍA DEL TRABAJO", estado: "Activo", fecha: "2025-05-01" },
        { id: '12', dia: "VIERNES, 18 DE ABRIL DE 2025", nombre: "VIERNES SANTO", estado: "Activo", fecha: "2025-04-18" },
        { id: '13', dia: "JUEVES, 17 DE ABRIL DE 2025", nombre: "JUEVES SANTO", estado: "Activo", fecha: "2025-04-17" },
        { id: '14', dia: "LUNES, 24 DE MARZO DE 2025", nombre: "DÍA DE SAN JOSÉ", estado: "Activo", fecha: "2025-03-24" },
        { id: '15', dia: "LUNES, 6 DE ENERO DE 2025", nombre: "DÍA DE LOS REYES MAGOS", estado: "Activo", fecha: "2025-01-06" },
        { id: '16', dia: "MIÉRCOLES, 1 DE ENERO DE 2025", nombre: "AÑO NUEVO", estado: "Activo", fecha: "2025-01-01" }
      ];
    }
  };

  const guardarDiaFestivo = async (dia: DiaFestivo): Promise<DiaFestivo> => {
    try {
      const response = await fetch(API_URLS.DIAS_FESTIVOS, {
        method: dia.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dia)
      });
      if (!response.ok) throw new Error('Error al guardar día festivo');
      return await response.json();
    } catch (error) {
      console.error('Error saving día festivo:', error);
      throw error;
    }
  };

  const eliminarDiaFestivo = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URLS.DIAS_FESTIVOS}?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar día festivo');
    } catch (error) {
      console.error('Error deleting día festivo:', error);
      throw error;
    }
  };

  // 📥 CARGAR DATOS AL INICIAR
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const data = await fetchDiasFestivos();
        setDiasFestivos(data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 🎯 FUNCIÓN PARA FORMATEAR FECHA EN ESPAÑOL
  const formatearFechaEspanol = (fecha: string): string => {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return fechaObj.toLocaleDateString('es-CO', opciones).toUpperCase();
  };

  // ➕ AGREGAR/EDITAR DÍA FESTIVO
  const handleGuardarDiaFestivo = async () => {
    if (!formData.nombre || !formData.fecha) {
      alert('Por favor complete todos los campos');
      return;
    }

    setGuardando(true);
    try {
      const diaFestivo: DiaFestivo = {
        id: editando?.id,
        dia: formatearFechaEspanol(formData.fecha),
        nombre: formData.nombre.toUpperCase(),
        estado: formData.estado,
        fecha: formData.fecha
      };

      const resultado = await guardarDiaFestivo(diaFestivo);
      
      if (editando) {
        setDiasFestivos(prev => 
          prev.map(item => item.id === resultado.id ? resultado : item)
        );
      } else {
        setDiasFestivos(prev => [...prev, resultado]);
      }

      setMostrarFormulario(false);
      setEditando(null);
      setFormData({ nombre: '', fecha: '', estado: 'Activo' });
      
    } catch (error) {
      alert('Error al guardar el día festivo');
    } finally {
      setGuardando(false);
    }
  };

  // 🗑️ ELIMINAR DÍA FESTIVO
  const handleEliminarDiaFestivo = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este día festivo?')) return;

    try {
      await eliminarDiaFestivo(id);
      setDiasFestivos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert('Error al eliminar el día festivo');
    }
  };

  // ✏️ EDITAR DÍA FESTIVO
  const handleEditarDiaFestivo = (dia: DiaFestivo) => {
    setEditando(dia);
    setFormData({
      nombre: dia.nombre,
      fecha: dia.fecha,
      estado: dia.estado
    });
    setMostrarFormulario(true);
  };

  // 🔍 FILTRAR POR AÑO
  const diasFestivosFiltrados = diasFestivos.filter(dia => 
    dia.dia.includes(filtroAnio)
  );

  // 🎯 PREPARAR DATOS PARA LA TABLA ESTANDARIZADA
  const datosParaTabla = diasFestivosFiltrados.map((festivo) => ({
    'Día': festivo.dia,
    'Nombre': festivo.nombre,
    'Estado': (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
        festivo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {festivo.estado}
      </span>
    ),
  }));

  const columnasTabla = ['Día', 'Nombre', 'Estado'];

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando días festivos...</p>
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
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Días Festivos</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestión de días festivos y feriados nacionales
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Año:</label>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
      
        </div>
      </div>

      {/* Cards de Información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total días festivos {filtroAnio}</div>
                <div className="text-2xl font-bold text-gray-900">{diasFestivosFiltrados.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Días activos</div>
                <div className="text-2xl font-bold text-gray-900">
                  {diasFestivosFiltrados.filter(d => d.estado === 'Activo').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Año consultado</div>
                <div className="text-2xl font-bold text-gray-900">{filtroAnio}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <CardTitle className="text-lg text-gray-900">
            Lista de Días Festivos {filtroAnio}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {diasFestivosFiltrados.length > 0 ? (
            <Tabla 
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={() => {}}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay días festivos registrados
              </h3>
              <p className="text-gray-500">
                No se encontraron días festivos para el año {filtroAnio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}