'use client';

import { useState, useEffect, useContext } from 'react';
import { DashboardContext } from "@/app/dashboard/layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, Plus, Edit, Trash2, FileText } from "lucide-react";
import Tabla from "@/components/Table";
import DiaFestivoForm from "@/components/form/create/DiaFestivoForm";

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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<DiaFestivo | null>(null);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

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

  const [refreshKeyLocal, setRefreshKeyLocal] = useState(0);

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
  }, [filtroAnio, refreshTrigger, refreshKeyLocal]);

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
    setMostrarFormulario(true);
  };

  const datosParaTabla = diasFestivos.map((festivo) => ({
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
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button onClick={() => { setEditando(null); setMostrarFormulario(true); }} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-md gap-2 font-bold px-6 h-11 rounded-xl transition-all active:scale-95">
            <Plus className="h-4 w-4" />
            Nuevo Festivo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Festivos {filtroAnio}</div>
                <div className="text-2xl font-bold text-gray-900">{diasFestivos.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Días Activos</div>
                <div className="text-2xl font-bold text-gray-900">
                  {diasFestivos.filter(d => d.estado === 'Activo').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Año Consultando</div>
                <div className="text-2xl font-bold text-gray-900">{filtroAnio}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-widest">
            Calendario de Festivos {filtroAnio}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cargando ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-400 font-medium">Actualizando calendario...</p>
            </div>
          ) : diasFestivos.length > 0 ? (
            <Tabla
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={() => { }}
            />
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No hay días registrados
              </h3>
              <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                No se encontraron días festivos para el año {filtroAnio}. Puede comenzar agregando uno nuevo.
              </p>
              <Button onClick={() => { setEditando(null); setMostrarFormulario(true); }} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-lg shadow-blue-200 gap-2 px-8 h-12 rounded-xl font-bold">
                <Plus className="h-4 w-4" />
                Registrar Primer Festivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <DiaFestivoForm 
            data={editando}
            onClose={() => {
              setMostrarFormulario(false);
              setEditando(null);
            }} 
            refreshData={() => setRefreshKeyLocal(prev => prev + 1)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}