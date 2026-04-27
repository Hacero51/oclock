'use client';

import { useState, useEffect, useContext } from 'react';
import { DashboardContext } from "@/app/dashboard/layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Plus, Save, Edit, Trash2, FileText } from "lucide-react";
import Tabla from "@/components/Table";

interface DiaFestivo {
  id?: string;
  dia: string;
  nombre: string;
  estado: string;
  fecha: string;
}

const API_URLS = {
  DIAS_FESTIVOS: '/api/dias-festivos'
};

export default function DiasFestivosPage() {
  const { refreshTrigger } = useContext(DashboardContext);
  const [diasFestivos, setDiasFestivos] = useState<DiaFestivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<DiaFestivo | null>(null);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    estado: 'Activo'
  });

  const fetchDiasFestivos = async (anio: string): Promise<DiaFestivo[]> => {
    try {
      const response = await fetch(`${API_URLS.DIAS_FESTIVOS}?year=${anio}`);
      if (!response.ok) throw new Error('Error al cargar días festivos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching días festivos:', error);
      return [];
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

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const data = await fetchDiasFestivos(filtroAnio);
        setDiasFestivos(data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [filtroAnio, refreshTrigger]);

  const handleGuardarDiaFestivo = async () => {
    if (!formData.nombre || !formData.fecha) {
      alert('Por favor complete todos los campos');
      return;
    }

    setGuardando(true);
    try {
      const diaFestivo: DiaFestivo = {
        id: editando?.id,
        dia: '', // Se calculará en el backend
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
        // If it's the same year, add it
        if (resultado.fecha.startsWith(filtroAnio)) {
          setDiasFestivos(prev => [...prev, resultado].sort((a, b) => a.fecha.localeCompare(b.fecha)));
        }
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

  const handleEliminarDiaFestivo = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este día festivo?')) return;

    try {
      await eliminarDiaFestivo(id);
      setDiasFestivos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert('Error al eliminar el día festivo');
    }
  };

  const handleEditarDiaFestivo = (dia: DiaFestivo) => {
    setEditando(dia);
    setFormData({
      nombre: dia.nombre,
      fecha: dia.fecha,
      estado: dia.estado
    });
    setMostrarFormulario(true);
  };

  const diasFestivosFiltrados = diasFestivos;

  const datosParaTabla = diasFestivosFiltrados.map((festivo) => ({
    'Día': festivo.dia,
    'Nombre': festivo.nombre,
    'Estado': (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${festivo.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {festivo.estado}
      </span>
    ),
    'Acciones': (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditarDiaFestivo(festivo); }}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={(e) => { e.stopPropagation(); handleEliminarDiaFestivo(festivo.id!); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }));

  const columnasTabla = ['Día', 'Nombre', 'Estado', 'Acciones'];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  if (cargando && diasFestivos.length === 0) {
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

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Año:</label>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button onClick={() => { setEditando(null); setFormData({ nombre: '', fecha: '', estado: 'Activo' }); setMostrarFormulario(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

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

      <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <CardTitle className="text-lg text-gray-900">
            Lista de Días Festivos {filtroAnio}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {cargando ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : diasFestivosFiltrados.length > 0 ? (
            <Tabla
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={() => { }}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay días festivos registrados
              </h3>
              <p className="text-gray-500 mb-4">
                No se encontraron días festivos para el año {filtroAnio}
              </p>
              <Button onClick={() => { setEditando(null); setFormData({ nombre: '', fecha: '', estado: 'Activo' }); setMostrarFormulario(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
                <Plus className="h-4 w-4" />
                Agregar Festivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Día Festivo' : 'Nuevo Día Festivo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 px-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nombre del Festivo</label>
              <Input
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Año Nuevo"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Estado</label>
              <select
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarFormulario(false)}>Cancelar</Button>
            <Button onClick={handleGuardarDiaFestivo} disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white">
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}