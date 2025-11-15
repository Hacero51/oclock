'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Calendar, Plus, Save, Edit, Trash2 } from "lucide-react";
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
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        festivo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {festivo.estado}
      </span>
    ),
  }));

  const columnasTabla = ['Día', 'Nombre', 'Estado'];

  if (cargando) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando días festivos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-700" size={28} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Días Festivos</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      {/* Información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-600">Total días festivos {filtroAnio}</div>
            <div className="text-2xl font-bold text-blue-800">{diasFestivosFiltrados.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-green-600">Días activos</div>
            <div className="text-2xl font-bold text-green-800">
              {diasFestivosFiltrados.filter(d => d.estado === 'Activo').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm text-purple-600">Año consultado</div>
            <div className="text-2xl font-bold text-purple-800">{filtroAnio}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="shadow-md border">
        <CardContent>
          {diasFestivosFiltrados.length > 0 ? (
            <Tabla 
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={() => {}}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay días festivos registrados para el año {filtroAnio}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}