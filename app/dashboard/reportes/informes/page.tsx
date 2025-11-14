'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-6">
      <h2 className="text-2xl font-bold mb-4">📑 Exportación de Informes</h2>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <select
          value={filtros.tipoInforme}
          onChange={(e) => handleFiltroChange('tipoInforme', e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="nomina">Exportación Nómina</option>
          <option value="nominaofima">Exportación Nómina Ofima ERP</option>
          <option value="asistencia">Resumen con Asistencia</option>
        </select>

        <input
          type="date"
          value={filtros.fechaInicio}
          onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          value={filtros.fechaFin}
          onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      {/* SECCIONES */}
      {filtros.tipoInforme === 'nomina' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">💼 Exportación Nómina</h3>
          <div className="flex gap-3">
            <button onClick={exportarExcelNomina} disabled={cargando} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded">
              📊 Excel
            </button>
            <button onClick={exportarPlanoNomina} disabled={cargando} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
              📄 Plano
            </button>
          </div>
        </div>
      )}

      {filtros.tipoInforme === 'nominaofima' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">🏢 Exportación Nómina Ofima ERP</h3>
          <div className="flex gap-3">
            <button onClick={exportarExcelOfima} disabled={cargando} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded">
              📊 Excel
            </button>
            <button onClick={exportarPlanoOfima} disabled={cargando} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
              📄 Plano
            </button>
          </div>
        </div>
      )}

      {filtros.tipoInforme === 'asistencia' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Resumen de Asistencia</h3>
          <div className="flex gap-3">
            <button
              onClick={exportarPlanoAsistencia}
              disabled={cargando}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              📄 Exportar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}