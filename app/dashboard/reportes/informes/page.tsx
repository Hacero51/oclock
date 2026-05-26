'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Download, Building } from 'lucide-react';
import Tabla from '@/components/Table';

type TipoInforme = 'nominaofima' | 'asistencia';

interface FiltrosInforme {
  fechaInicio: string;
  fechaFin: string;
  tipoInforme: TipoInforme;
}

interface RegistroOfima {
  CODCC: string;
  GRUPO: string;
  CODIGO: string;
  NOTA: string;
  CONCEP: string;
  NROHORAS: number;
  VALOR: number;
  NOMCONCEPTO: string;
  FECHA: string;
}

export default function ExportacionInformes() {
  // State for ordinary hours
  const [filtrosOrd, setFiltrosOrd] = useState<FiltrosInforme>({
    fechaInicio: '',
    fechaFin: '',
    tipoInforme: 'nominaofima',
  });
  const [datosOrd, setDatosOrd] = useState<RegistroOfima[]>([]);

  // State for extra hours
  const [filtrosExt, setFiltrosExt] = useState<FiltrosInforme>({
    fechaInicio: '',
    fechaFin: '',
    tipoInforme: 'nominaofima',
  });
  const [datosExt, setDatosExt] = useState<RegistroOfima[]>([]);

  const [cargando, setCargando] = useState(false);

  // Initialize both filter sets to current month on mount
  useEffect(() => {
    const hoyObj = new Date();
    const primerDia = new Date(hoyObj.getFullYear(), hoyObj.getMonth(), 1);
    const hoy = new Date(hoyObj.getTime() - hoyObj.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    const primerDiaStr = new Date(primerDia.getTime() - primerDia.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    setFiltrosOrd(prev => ({ ...prev, fechaInicio: primerDiaStr, fechaFin: hoy }));
    setFiltrosExt(prev => ({ ...prev, fechaInicio: primerDiaStr, fechaFin: hoy }));
  }, []);

  const cargarDatos = async (filtros: FiltrosInforme): Promise<RegistroOfima[]> => {
    const res = await fetch(
      `/api/reportes/nomina-ofima?startDate=${filtros.fechaInicio}&endDate=${filtros.fechaFin}`
    );
    if (!res.ok) throw new Error('Error al cargar datos');
    const data = await res.json();
    return data as RegistroOfima[];
  };

  const generarOrd = async () => {
    if (!filtrosOrd.fechaInicio || !filtrosOrd.fechaFin) {
      alert('Seleccione rango de fechas para Horas Ordinarias');
      return;
    }
    setCargando(true);
    try {
      const data = await cargarDatos(filtrosOrd);
      const ordinarias = data.filter(d => d.CONCEP === 'A01');
      setDatosOrd(ordinarias);
    } catch (e) {
      console.error(e);
      alert('Error al cargar datos de Horas Ordinarias');
    } finally {
      setCargando(false);
    }
  };

  const generarExt = async () => {
    if (!filtrosExt.fechaInicio || !filtrosExt.fechaFin) {
      alert('Seleccione rango de fechas para Horas Extras');
      return;
    }
    setCargando(true);
    try {
      const data = await cargarDatos(filtrosExt);
      const extras = data.filter(d => d.CONCEP !== 'A01');
      setDatosExt(extras);
    } catch (e) {
      console.error(e);
      alert('Error al cargar datos de Horas Extras');
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = () => {
  if (datosOrd.length === 0 && datosExt.length === 0) {
    alert('No hay datos para exportar');
    return;
  }
  const libro = XLSX.utils.book_new();
  if (datosOrd.length > 0) {
    const hojaOrd = XLSX.utils.json_to_sheet(datosOrd);
    XLSX.utils.book_append_sheet(libro, hojaOrd, 'Horas Ordinarias');
  }
  if (datosExt.length > 0) {
    const hojaExt = XLSX.utils.json_to_sheet(datosExt);
    XLSX.utils.book_append_sheet(libro, hojaExt, 'Horas Extras');
  }
  const nombreArchivo = `Reporte_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(libro, nombreArchivo);
};

// Exportar solo Horas Ordinarias a Excel
const exportarOrdExcel = () => {
  if (datosOrd.length === 0) {
    alert('No hay datos de Horas Ordinarias para exportar');
    return;
  }
  const libro = XLSX.utils.book_new();
  const hojaOrd = XLSX.utils.json_to_sheet(datosOrd);
  XLSX.utils.book_append_sheet(libro, hojaOrd, 'Horas Ordinarias');
  const nombreArchivo = `Horas_Ordinarias_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(libro, nombreArchivo);
};

// Exportar solo Horas Extras a Excel
const exportarExtExcel = () => {
  if (datosExt.length === 0) {
    alert('No hay datos de Horas Extras para exportar');
    return;
  }
  const libro = XLSX.utils.book_new();
  const hojaExt = XLSX.utils.json_to_sheet(datosExt);
  XLSX.utils.book_append_sheet(libro, hojaExt, 'Horas Extras');
  const nombreArchivo = `Horas_Extras_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(libro, nombreArchivo);
};


  const getTipoColor = (tipo: TipoInforme) => {
    switch (tipo) {
      case 'nominaofima':
        return 'text-green-600';
      case 'asistencia':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exportación de Informes</h1>
            <p className="text-sm text-gray-600 mt-1">Genera y exporta reportes del sistema</p>
          </div>
        </div>
      </div>

      {/* Bloque Horas Ordinarias */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">Horas Ordinarias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <Input
                type="date"
                value={filtrosOrd.fechaInicio}
                onChange={e => setFiltrosOrd(p => ({ ...p, fechaInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <Input
                type="date"
                value={filtrosOrd.fechaFin}
                onChange={e => setFiltrosOrd(p => ({ ...p, fechaFin: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex items-end">
              <Button onClick={generarOrd} disabled={cargando} className="bg-blue-600 hover:bg-blue-700 text-white">
                {cargando ? 'Generando...' : 'Generar Ordinarias'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bloque Horas Extras */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">Horas Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <Input
                type="date"
                value={filtrosExt.fechaInicio}
                onChange={e => setFiltrosExt(p => ({ ...p, fechaInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <Input
                type="date"
                value={filtrosExt.fechaFin}
                onChange={e => setFiltrosExt(p => ({ ...p, fechaFin: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex items-end">
              <Button onClick={generarExt} disabled={cargando} className="bg-blue-600 hover:bg-blue-700 text-white">
                {cargando ? 'Generando...' : 'Generar Extras'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exportar opciones */}
      <div className="flex justify-end gap-4">
        <Button onClick={exportarExcel} disabled={cargando} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Download className="h-4 w-4" /> Exportar Todas
        </Button>
        <Button onClick={exportarOrdExcel} disabled={cargando} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4" /> Exportar Ordinarias
        </Button>
        <Button onClick={exportarExtExcel} disabled={cargando} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Download className="h-4 w-4" /> Exportar Extras
        </Button>
      </div>

      {/* Tabla Ordenarias */}
      {datosOrd.length > 0 && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl mt-8">
          <CardHeader className="pb-4 flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Building className={`h-5 w-5 ${getTipoColor('nominaofima')}`} /> Horas Ordinarias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabla
              columnas={["CODCC", "CODIGO", "CONCEP", "FECHA", "GRUPO", "NOTA", "NROHORAS", "VALOR"]}
              datos={datosOrd.map(row => ({
                CODCC: row.CODCC,
                CODIGO: row.CODIGO,
                CONCEP: row.CONCEP,
                FECHA: row.FECHA,
                GRUPO: row.GRUPO,
                NOTA: row.NOTA,
                NROHORAS: <span className="font-bold">{row.NROHORAS.toFixed(2)}</span>,
                VALOR: row.VALOR,
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabla Extras */}
      {datosExt.length > 0 && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl mt-8">
          <CardHeader className="pb-4 flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Building className={`h-5 w-5 ${getTipoColor('nominaofima')}`} /> Horas Extras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabla
              columnas={["CODCC", "CODIGO", "CONCEP", "FECHA", "GRUPO", "NOTA", "NROHORAS", "VALOR"]}
              datos={datosExt.map(row => ({
                CODCC: row.CODCC,
                CODIGO: row.CODIGO,
                CONCEP: row.CONCEP,
                FECHA: row.FECHA,
                GRUPO: row.GRUPO,
                NOTA: row.NOTA,
                NROHORAS: <span className="font-bold">{row.NROHORAS.toFixed(2)}</span>,
                VALOR: row.VALOR,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}