'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input.JSX";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, BarChart3, Building, Users } from "lucide-react";

type TipoInforme = 'nomina' | 'nominaofima' | 'asistencia';

interface FiltrosInforme {
  fechaInicio: string;
  fechaFin: string;
  tipoInforme: TipoInforme;
}

interface RegistroNomina {
  cedula: string;
  tipoConcepto: string;
  valor: number;
  fechaProceso: string;
  empleado: string;
  concepto: string;
}

interface RegistroOfima {
  FECHA: string;
  FECING: string;
  CODIGO: string;
  CODCC: string;
  CONCEP: string;
  NROHORAS: number;
  VALOR: number;
  GRUPO: string;
  FECLIQUIDA: string;
  FECMOD: string;
  INTEGRADO: number;
  NOMABIERTO: number;
}

interface RegistroAsistencia {
  tercero: string;
  nombre: string;
  concepto: string;
  descripcion: string;
  horas: number;
}

export default function ExportacionInformes() {
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fechaInicio: '',
    fechaFin: '',
    tipoInforme: 'nomina',
  });

  const [cargando, setCargando] = useState(false);
  const [datosNomina, setDatosNomina] = useState<RegistroNomina[]>([]);
  const [datosOfima, setDatosOfima] = useState<RegistroOfima[]>([]);
  const [datosAsistencia, setDatosAsistencia] = useState<RegistroAsistencia[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalRegistros: 0,
    totalValor: 0,
  });

  // Inicializar fechas
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setFiltros((prev) => ({ ...prev, fechaInicio: haceUnaSemana, fechaFin: hoy }));
  }, []);

  // 🔄 Simula carga desde API según el tipo de informe
  useEffect(() => {
    if (!filtros.fechaInicio || !filtros.fechaFin) return;
    cargarDatosInforme();
  }, [filtros]);

  const handleFiltroChange = (campo: keyof FiltrosInforme, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const cargarDatosInforme = async () => {
    setCargando(true);

    try {
      switch (filtros.tipoInforme) {
        case 'nomina':
          // Simulación de datos nómina
          const hoy = new Date().toISOString().split('T')[0];
          const dataNomina: RegistroNomina[] = [
            { cedula: '62682', tipoConcepto: 'A02', valor: 22.25, fechaProceso: hoy, empleado: 'EMPLEADO 1', concepto: 'HORAS NORMALES' },
            { cedula: '1106889787', tipoConcepto: 'R48', valor: 2.25, fechaProceso: hoy, empleado: 'EMPLEADO 2', concepto: 'HORAS EXTRAS' },
            { cedula: '35119', tipoConcepto: 'A02', valor: 12.00, fechaProceso: hoy, empleado: 'EMPLEADO 3', concepto: 'HORAS NORMALES' },
          ];
          setDatosNomina(dataNomina);
          calcularEstadisticas(dataNomina);
          break;

        case 'nominaofima':
          // Simulación de datos Ofima ERP
          const dataOfima: RegistroOfima[] = [
            {
              FECHA: '01/11/2025', FECING: '15/11/2025', CODIGO: '1106889787',
              CODCC: '153', CONCEP: 'R48', NROHORAS: 22.25, VALOR: 0, GRUPO: 'REINO',
              FECLIQUIDA: '01/01/1900', FECMOD: '01/01/1900', INTEGRADO: 0, NOMABIERTO: 1,
            },
          ];
          setDatosOfima(dataOfima);
          break;

        case 'asistencia':
          // Simulación de datos asistencia
          const dataAsistencia: RegistroAsistencia[] = [
            { tercero: "35119", nombre: "EMPLEADO 1", concepto: "HOR", descripcion: "HORAS LABORADAS", horas: 8 },
            { tercero: "35119", nombre: "EMPLEADO 1", concepto: "EXT", descripcion: "EXTRAS", horas: 2 },
            { tercero: "1106889787", nombre: "EMPLEADO 2", concepto: "HOR", descripcion: "HORAS LABORADAS", horas: 7 },
          ];
          setDatosAsistencia(dataAsistencia);
          break;
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (datos: RegistroNomina[]) => {
    const totalRegistros = datos.length;
    const totalValor = datos.reduce((sum, r) => sum + r.valor, 0);
    setEstadisticas({ totalRegistros, totalValor });
  };

  // === FUNCIÓN MEJORADA PARA CALCULAR PERIODO ===
  const calcularPeriodoAsistencia = () => {
    if (!filtros.fechaInicio) return { anio: '2024', quincenaAnual: '025' };

    const fechaInicio = new Date(filtros.fechaInicio);
    const anio = fechaInicio.getFullYear();
    
    // Calcular quincena anual (1-24)
    const mes = fechaInicio.getMonth(); // 0-11
    const dia = fechaInicio.getDate();
    const quincenaMes = dia <= 15 ? 1 : 2;
    const quincenaAnual = (mes * 2) + quincenaMes;
    
    return {
      anio: anio.toString(),
      quincenaAnual: quincenaAnual.toString().padStart(3, '0')
    };
  };

  // === Exportaciones de NÓMINA ===
  const exportarExcelNomina = () => {
    if (datosNomina.length === 0) return alert('No hay datos para exportar');

    const datosConcatenados = datosNomina.map((r) => {
      const valor = r.valor.toFixed(2).padStart(10, '0');
      const fecha = new Date(r.fechaProceso).toLocaleDateString('es-CO');
      const registro = `${r.cedula}${r.tipoConcepto}${valor}${fecha}`;
      return { Registro: registro };
    });

    const hoja = XLSX.utils.json_to_sheet(datosConcatenados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Nómina');
    XLSX.writeFile(libro, `nomina_${filtros.fechaFin.replace(/-/g, '')}.xlsx`);
  };

  const exportarPlanoNomina = () => {
    if (datosNomina.length === 0) return alert('No hay datos para exportar');

    const contenido = datosNomina
      .map((r) => {
        const valor = r.valor.toFixed(2).padStart(10, '0');
        const fecha = new Date(r.fechaProceso).toLocaleDateString('es-CO');
        return `${r.cedula}${r.tipoConcepto}${valor}${fecha}`;
      })
      .join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nomina_${filtros.fechaFin.replace(/-/g, '')}.txt`;
    link.click();
  };

  // === Exportaciones OFIMA ===
  const exportarExcelOfima = () => {
    if (datosOfima.length === 0) return alert('No hay datos para exportar');
    const hoja = XLSX.utils.json_to_sheet(datosOfima);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'MVNOVPER');
    XLSX.writeFile(libro, `MVNOVPER_${filtros.fechaFin.replace(/-/g, '')}.xlsx`);
  };

  const exportarPlanoOfima = () => {
    if (datosOfima.length === 0) return alert('No hay datos para exportar');
    const encabezado = Object.keys(datosOfima[0]).join('\t');
    const lineas = datosOfima.map((r) => Object.values(r).join('\t'));
    const contenido = [encabezado, ...lineas].join('\n');
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MVNOVPER_${filtros.fechaFin.replace(/-/g, '')}.txt`;
    link.click();
  };

  // === Exportaciones ASISTENCIA MEJORADA ===
  const exportarPlanoAsistencia = () => {
    if (datosAsistencia.length === 0) return alert("No hay datos para exportar");

    // Calcular periodo basado en la fecha de inicio
    const periodo = calcularPeriodoAsistencia();

    // === TITULO / ENCABEZADO SUPERIOR ===
    const titulo = "Reporte de asistencia";
    const lineaTitulo = titulo;

    const lineaPeriodo =
      "Año: ".padEnd(6) +
      periodo.anio +
      "   " +
      "Periodo: ".padEnd(10) +
      periodo.quincenaAnual;

    // === ENCABEZADOS DE TABLA (ALINEADOS A LA DERECHA) ===
    const encabezado =
      "Tercero".padStart(12) +
      "Nombre".padStart(37) +
      "Concepto".padStart(10) +
      "Descripcion".padStart(38) +
      "Horas".padStart(10);

    // === CUERPO DEL INFORME ===
    const contenido = datosAsistencia
      .map((r) => {
        const tercero = String(r.tercero).padStart(12);
        const nombre = String(r.nombre).padStart(37);
        const concepto = String(r.concepto).padStart(10);
        const descripcion = String(r.descripcion).padStart(38);

        // Formato de horas
        const horasNum = parseFloat(String(r.horas).replace(",", "."));
        const horasFmt = String(horasNum).replace(".", ",").padStart(10);

        return tercero + nombre + concepto + descripcion + horasFmt;
      })
      .join("\n");

    const textoFinal =
      `${lineaTitulo}\n` +
      `${lineaPeriodo}\n\n` +
      `${encabezado}\n` +
      `${contenido}`;

    const blob = new Blob([textoFinal], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `asistencia_${periodo.quincenaAnual}_${periodo.anio}.txt`;
    link.click();
  };

  // Iconos para cada tipo de informe
  const getTipoIcono = (tipo: TipoInforme) => {
    switch (tipo) {
      case 'nomina': return <Users className="h-5 w-5" />;
      case 'nominaofima': return <Building className="h-5 w-5" />;
      case 'asistencia': return <BarChart3 className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTipoColor = (tipo: TipoInforme) => {
    switch (tipo) {
      case 'nomina': return 'text-blue-600';
      case 'nominaofima': return 'text-green-600';
      case 'asistencia': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exportación de Informes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Genera y exporta reportes del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">Configuración del Informe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Informe
              </label>
              <Select
                value={filtros.tipoInforme}
                onValueChange={(value) => handleFiltroChange('tipoInforme', value)}
              >
                <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nomina">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Exportación Nómina
                    </div>
                  </SelectItem>
                  <SelectItem value="nominaofima">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Exportación Nómina Ofima ERP
                    </div>
                  </SelectItem>
                  <SelectItem value="asistencia">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Resumen con Asistencia
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secciones de Exportación */}
      {filtros.tipoInforme === 'nomina' && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Users className={`h-5 w-5 ${getTipoColor('nomina')}`} />
              Exportación Nómina
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={exportarExcelNomina} 
                disabled={cargando} 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button 
                onClick={exportarPlanoNomina} 
                disabled={cargando} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Exportar Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtros.tipoInforme === 'nominaofima' && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Building className={`h-5 w-5 ${getTipoColor('nominaofima')}`} />
              Exportación Nómina Ofima ERP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={exportarExcelOfima} 
                disabled={cargando} 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button 
                onClick={exportarPlanoOfima} 
                disabled={cargando} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Exportar Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtros.tipoInforme === 'asistencia' && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <BarChart3 className={`h-5 w-5 ${getTipoColor('asistencia')}`} />
              Resumen de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={exportarPlanoAsistencia}
                disabled={cargando}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Exportar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}