'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Calendar, BarChart3, Building, HelpCircle, AlertCircle, Info, Split } from "lucide-react";
import Tabla from "@/components/Table";

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

interface RegistroAsistencia {
  tercero: string;
  nombre: string;
  concepto: string;
  descripcion: string;
  horas: number;
}

export default function ExportacionInformes() {
  const CheckboxComponent = Checkbox as any;
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fechaInicio: '',
    fechaFin: '',
    tipoInforme: 'nominaofima',
  });

  const [modoFechas, setModoFechas] = useState<'unico' | 'doble'>('unico');
  const [rango2, setRango2] = useState({ fechaInicio: '', fechaFin: '' });
  const [tipoSalida, setTipoSalida] = useState<'consolidado' | 'independiente'>('consolidado');
  const [filtroHoras, setFiltroHoras] = useState<'todas' | 'ordinarias' | 'extras' | 'separar'>('todas');
  const [modoExcelIndependiente, setModoExcelIndependiente] = useState<'pestanas' | 'archivos'>('pestanas');

  // Checkboxes de Agrupación
  const [detallarPorDia, setDetallarPorDia] = useState<boolean>(true);
  const [consolidarPorConcepto, setConsolidarPorConcepto] = useState<boolean>(false);

  const [cargando, setCargando] = useState(false);
  const [datosOfima, setDatosOfima] = useState<RegistroOfima[]>([]);
  const [datosOfima2, setDatosOfima2] = useState<RegistroOfima[]>([]);
  const [datosAsistencia, setDatosAsistencia] = useState<RegistroAsistencia[]>([]);

  // Para alternar la vista previa del bloque en modo doble independiente
  const [bloqueVistaPrevia, setBloqueVistaPrevia] = useState<1 | 2>(1);

  // Conceptos de horas ordinarias
  const CODIGOS_ORDINARIOS = ['A01', 'A49', 'A05', 'A50'];

  const esOrdinaria = (concepto: string) => CODIGOS_ORDINARIOS.includes(concepto);

  // Inicializar fechas
  useEffect(() => {
    const hoyObj = new Date();
    const year = hoyObj.getFullYear();
    const month = hoyObj.getMonth();
    
    // Rango Único: Mes completo
    const primerDia = new Date(year, month, 1);
    const hoy = new Date(hoyObj.getTime() - (hoyObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const primerDiaStr = new Date(primerDia.getTime() - (primerDia.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    setFiltros((prev) => ({ ...prev, fechaInicio: primerDiaStr, fechaFin: hoy }));

    // Extras por defecto (ej. 13 al 27 del mes actual según el ejemplo de corte)
    const extInicio = `${year}-${String(month + 1).padStart(2, '0')}-13`;
    const extFin = `${year}-${String(month + 1).padStart(2, '0')}-27`;
    setRango2({ fechaInicio: extInicio, fechaFin: extFin });
  }, []);

  // Manejar el cambio de modo de fechas y sugerir periodos automáticos desfasados
  const handleCambioModoFechas = (modo: 'unico' | 'doble') => {
    setModoFechas(modo);
    const hoyObj = new Date();
    const year = hoyObj.getFullYear();
    const month = hoyObj.getMonth();

    if (modo === 'doble') {
      // Ajustar fechas por defecto con el ejemplo exacto del usuario:
      // Ordinarias: 15 al último día del mes actual (ej. 15 al 30 de mayo)
      const ordInicio = `${year}-${String(month + 1).padStart(2, '0')}-15`;
      const ultimoDia = new Date(year, month + 1, 0).getDate();
      const ordFin = `${year}-${String(month + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

      // Extras: 13 al 27 del mes actual
      const extInicio = `${year}-${String(month + 1).padStart(2, '0')}-13`;
      const extFin = `${year}-${String(month + 1).padStart(2, '0')}-27`;

      setFiltros(prev => ({ ...prev, fechaInicio: ordInicio, fechaFin: ordFin }));
      setRango2({ fechaInicio: extInicio, fechaFin: extFin });
    } else {
      const primerDia = new Date(year, month, 1);
      const hoy = new Date(hoyObj.getTime() - (hoyObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const primerDiaStr = new Date(primerDia.getTime() - (primerDia.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setFiltros(prev => ({ ...prev, fechaInicio: primerDiaStr, fechaFin: hoy }));
    }
  };

  // Mutua exclusión de checkboxes
  const handleToggleDetallar = (checked: boolean) => {
    if (checked) {
      setDetallarPorDia(true);
      setConsolidarPorConcepto(false);
    } else {
      setDetallarPorDia(false);
      setConsolidarPorConcepto(true);
    }
  };

  const handleToggleConsolidar = (checked: boolean) => {
    if (checked) {
      setConsolidarPorConcepto(true);
      setDetallarPorDia(false);
    } else {
      setConsolidarPorConcepto(false);
      setDetallarPorDia(true);
    }
  };

  // Convertir YYYY-MM-DD a DD/MM/YYYY para OFIMA
  const formatearFechaLocal = (fechaISO: string) => {
    if (!fechaISO) return '';
    const [y, m, d] = fechaISO.split('-');
    return `${d}/${m}/${y}`;
  };

  // 🔄 Carga datos desde API
  const cargarDatosInforme = async () => {
    setCargando(true);
    setDatosOfima([]);
    setDatosOfima2([]);
    setDatosAsistencia([]);

    try {
      if (filtros.tipoInforme === 'nominaofima') {
        if (modoFechas === 'unico') {
          const res = await fetch(`/api/reportes/nomina-ofima?startDate=${filtros.fechaInicio}&endDate=${filtros.fechaFin}`);
          if (!res.ok) throw new Error("Error al cargar datos de Ofima");
          const data = await res.json();
          setDatosOfima(data);
        } else {
          // Modo Doble Especializado:
          // 1. Rango Ordinarias (filtros.fechaInicio a filtros.fechaFin)
          // 2. Rango Extras (rango2.fechaInicio a rango2.fechaFin)
          const [res1, res2] = await Promise.all([
            fetch(`/api/reportes/nomina-ofima?startDate=${filtros.fechaInicio}&endDate=${filtros.fechaFin}`),
            fetch(`/api/reportes/nomina-ofima?startDate=${rango2.fechaInicio}&endDate=${rango2.fechaFin}`)
          ]);

          if (!res1.ok || !res2.ok) throw new Error("Error al cargar datos de Ofima en uno de los bloques");

          const data1: RegistroOfima[] = await res1.json();
          const data2: RegistroOfima[] = await res2.json();

          // Filtrar data1 para mantener SOLO ordinarias
          const ordinariasFiltradas = data1.filter(r => esOrdinaria(r.CONCEP));
          // Filtrar data2 para mantener SOLO extras
          const extrasFiltradas = data2.filter(r => !esOrdinaria(r.CONCEP));

          setDatosOfima(ordinariasFiltradas);
          setDatosOfima2(extrasFiltradas);
        }
      }
      else if (filtros.tipoInforme === 'asistencia') {
        const dataAsistencia: RegistroAsistencia[] = [
          { tercero: "35119", nombre: "EMPLEADO 1", concepto: "HOR", descripcion: "HORAS LABORADAS", horas: 8 },
          { tercero: "1106889787", nombre: "EMPLEADO 2", concepto: "HOR", descripcion: "HORAS LABORADAS", horas: 7 },
        ];
        setDatosAsistencia(dataAsistencia);
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
      alert('Error al cargar los datos del informe');
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (campo: keyof FiltrosInforme, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGenerar = () => {
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      alert("Seleccione fechas");
      return;
    }
    if (modoFechas === 'doble' && (!rango2.fechaInicio || !rango2.fechaFin)) {
      alert("Seleccione fechas para el rango de extras");
      return;
    }
    cargarDatosInforme();
  };

  // Helper de filtrado local
  const filtrarDatos = (datos: RegistroOfima[], filtro: typeof filtroHoras) => {
    if (modoFechas === 'doble') {
      if (filtro === 'ordinarias') {
        return datos.filter(d => esOrdinaria(d.CONCEP));
      }
      if (filtro === 'extras') {
        return datos.filter(d => !esOrdinaria(d.CONCEP));
      }
      return datos;
    }

    // Modo Único
    if (filtro === 'todas' || filtro === 'separar') return datos;
    if (filtro === 'ordinarias') {
      return datos.filter(d => esOrdinaria(d.CONCEP));
    }
    if (filtro === 'extras') {
      return datos.filter(d => !esOrdinaria(d.CONCEP));
    }
    return datos;
  };

  // Agrupar por Concepto (Suma horas totales para una sola línea)
  const agruparPorConcepto = (datos: RegistroOfima[], fechaConsolidada: string) => {
    const mapa = new Map<string, RegistroOfima>();
    
    datos.forEach(row => {
      const key = `${row.CODIGO}|${row.CONCEP}|${row.CODCC}`;
      const existente = mapa.get(key);
      if (existente) {
        existente.NROHORAS += row.NROHORAS;
      } else {
        mapa.set(key, {
          ...row,
          FECHA: fechaConsolidada,
        });
      }
    });

    const resultado = Array.from(mapa.values());
    
    // Redondear horas
    resultado.forEach(r => {
      r.NROHORAS = Math.round(r.NROHORAS * 100) / 100;
    });

    // Ordenar por empleado y concepto
    resultado.sort((a, b) => {
      if (String(a.CODIGO) !== String(b.CODIGO)) return String(a.CODIGO).localeCompare(String(b.CODIGO));
      return a.CONCEP.localeCompare(b.CONCEP);
    });

    return resultado;
  };

  // Combinador cronológico
  const combinarDatos = (arr1: RegistroOfima[], arr2: RegistroOfima[]) => {
    const comb = [...arr1, ...arr2];
    comb.sort((a, b) => {
      const [da, ma, ya] = a.FECHA.split('/').map(Number);
      const [db, mb, yb] = b.FECHA.split('/').map(Number);
      const dateA = ya * 10000 + ma * 100 + da;
      const dateB = yb * 10000 + mb * 100 + db;
      if (dateA !== dateB) return dateA - dateB;
      if (String(a.CODIGO) !== String(b.CODIGO)) return String(a.CODIGO).localeCompare(String(b.CODIGO));
      return a.CONCEP.localeCompare(b.CONCEP);
    });
    return comb;
  };

  // === Exportaciones OFIMA ===
  const exportarExcelOfima = () => {
    let d1 = filtrarDatos(datosOfima, filtroHoras); // Ordinarias en modo doble
    let d2 = filtrarDatos(datosOfima2, filtroHoras); // Extras en modo doble

    if (consolidarPorConcepto) {
      d1 = agruparPorConcepto(d1, formatearFechaLocal(filtros.fechaFin));
      d2 = agruparPorConcepto(d2, formatearFechaLocal(rango2.fechaFin));
    }

    const tieneD1 = d1.length > 0;
    const tieneD2 = d2.length > 0;

    if (!tieneD1 && (!tieneD2 || modoFechas === 'unico')) {
      return alert('No hay datos para exportar con los filtros seleccionados');
    }

    const libro = XLSX.utils.book_new();

    if (modoFechas === 'unico') {
      if (filtroHoras === 'separar') {
        const ord = d1.filter(r => esOrdinaria(r.CONCEP));
        const ext = d1.filter(r => !esOrdinaria(r.CONCEP));
        
        if (ord.length > 0) XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(ord), 'Ordinarias');
        if (ext.length > 0) XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(ext), 'Extras');
        
        XLSX.writeFile(libro, `MVNOVPER_Separado_${filtros.fechaFin.replace(/-/g, '')}.xlsx`);
      } else {
        XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(d1), 'MVNOVPER');
        XLSX.writeFile(libro, `MVNOVPER_${filtros.fechaFin.replace(/-/g, '')}.xlsx`);
      }
    } else {
      // Modo Doble Especializado
      if (tipoSalida === 'consolidado') {
        const comb = combinarDatos(d1, d2);
        if (filtroHoras === 'separar') {
          const ord = comb.filter(r => esOrdinaria(r.CONCEP));
          const ext = comb.filter(r => !esOrdinaria(r.CONCEP));
          
          if (ord.length > 0) XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(ord), 'Ordinarias');
          if (ext.length > 0) XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(ext), 'Extras');
          
          XLSX.writeFile(libro, `MVNOVPER_Consolidado_Separado_${rango2.fechaFin.replace(/-/g, '')}.xlsx`);
        } else {
          XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(comb), 'Consolidado');
          XLSX.writeFile(libro, `MVNOVPER_Consolidado_${rango2.fechaFin.replace(/-/g, '')}.xlsx`);
        }
      } else {
        // Independiente
        if (modoExcelIndependiente === 'pestanas') {
          if (tieneD1) XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(d1), 'Horas Ordinarias');
          if (tieneD2) XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(d2), 'Horas Extras');
          
          XLSX.writeFile(libro, `MVNOVPER_Ordinarias_Extras_${rango2.fechaFin.replace(/-/g, '')}.xlsx`);
        } else {
          // Archivos separados
          const lib1 = XLSX.utils.book_new();
          if (tieneD1) {
            XLSX.utils.book_append_sheet(lib1, XLSX.utils.json_to_sheet(d1), 'Ordinarias');
            XLSX.writeFile(lib1, `MVNOVPER_Ordinarias_${filtros.fechaFin.replace(/-/g, '')}.xlsx`);
          }

          const lib2 = XLSX.utils.book_new();
          if (tieneD2) {
            XLSX.utils.book_append_sheet(lib2, XLSX.utils.json_to_sheet(d2), 'Extras');
            XLSX.writeFile(lib2, `MVNOVPER_Extras_${rango2.fechaFin.replace(/-/g, '')}.xlsx`);
          }
        }
      }
    }
  };

  const exportarPlanoOfima = () => {
    let d1 = filtrarDatos(datosOfima, filtroHoras); // Ordinarias en modo doble
    let d2 = filtrarDatos(datosOfima2, filtroHoras); // Extras en modo doble

    if (consolidarPorConcepto) {
      d1 = agruparPorConcepto(d1, formatearFechaLocal(filtros.fechaFin));
      d2 = agruparPorConcepto(d2, formatearFechaLocal(rango2.fechaFin));
    }

    const tieneD1 = d1.length > 0;
    const tieneD2 = d2.length > 0;

    if (!tieneD1 && (!tieneD2 || modoFechas === 'unico')) {
      return alert('No hay datos para exportar con los filtros seleccionados');
    }

    const helperPlano = (datos: RegistroOfima[], nombreArchivo: string) => {
      if (datos.length === 0) return;
      const encabezado = Object.keys(datos[0]).join('\t');
      const lineas = datos.map((r) => Object.values(r).join('\t'));
      const contenido = [encabezado, ...lineas].join('\n');
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = nombreArchivo;
      link.click();
    };

    if (modoFechas === 'unico') {
      if (filtroHoras === 'separar') {
        const ord = d1.filter(r => esOrdinaria(r.CONCEP));
        const ext = d1.filter(r => !esOrdinaria(r.CONCEP));
        helperPlano(ord, `MVNOVPER_Ordinarias_${filtros.fechaFin.replace(/-/g, '')}.txt`);
        setTimeout(() => {
          helperPlano(ext, `MVNOVPER_Extras_${filtros.fechaFin.replace(/-/g, '')}.txt`);
        }, 300);
      } else {
        helperPlano(d1, `MVNOVPER_${filtros.fechaFin.replace(/-/g, '')}.txt`);
      }
    } else {
      // Modo Doble Especializado
      if (tipoSalida === 'consolidado') {
        const comb = combinarDatos(d1, d2);
        if (filtroHoras === 'separar') {
          const ord = comb.filter(r => esOrdinaria(r.CONCEP));
          const ext = comb.filter(r => !esOrdinaria(r.CONCEP));
          helperPlano(ord, `MVNOVPER_Consolidado_Ordinarias_${rango2.fechaFin.replace(/-/g, '')}.txt`);
          setTimeout(() => {
            helperPlano(ext, `MVNOVPER_Consolidado_Extras_${rango2.fechaFin.replace(/-/g, '')}.txt`);
          }, 300);
        } else {
          helperPlano(comb, `MVNOVPER_Consolidado_${rango2.fechaFin.replace(/-/g, '')}.txt`);
        }
      } else {
        // Independiente: 2 archivos planos separados
        helperPlano(d1, `MVNOVPER_Ordinarias_${filtros.fechaFin.replace(/-/g, '')}.txt`);
        setTimeout(() => {
          helperPlano(d2, `MVNOVPER_Extras_${rango2.fechaFin.replace(/-/g, '')}.txt`);
        }, 300);
      }
    }
  };

  // === Exportaciones ASISTENCIA ===
  const exportarPlanoAsistencia = () => {
    if (datosAsistencia.length === 0) return alert("No hay datos para exportar");
    alert("Función básica mantenida");
  };

  const getTipoColor = (tipo: TipoInforme) => {
    switch (tipo) {
      case 'nominaofima': return 'text-green-600';
      case 'asistencia': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Obtener datos activos para la vista previa
  const obtenerDatosVistaPrevia = () => {
    let d1 = filtrarDatos(datosOfima, filtroHoras); // Ordinarias en modo doble (ya pre-filtradas al cargar)
    let d2 = filtrarDatos(datosOfima2, filtroHoras); // Extras en modo doble (ya pre-filtradas al cargar)

    if (modoFechas === 'unico') {
      if (consolidarPorConcepto) {
        return agruparPorConcepto(d1, formatearFechaLocal(filtros.fechaFin));
      }
      return d1;
    } else {
      if (tipoSalida === 'consolidado') {
        const c1 = consolidarPorConcepto ? agruparPorConcepto(d1, formatearFechaLocal(filtros.fechaFin)) : d1;
        const c2 = consolidarPorConcepto ? agruparPorConcepto(d2, formatearFechaLocal(rango2.fechaFin)) : d2;
        return combinarDatos(c1, c2);
      } else {
        if (bloqueVistaPrevia === 1) {
          return consolidarPorConcepto ? agruparPorConcepto(d1, formatearFechaLocal(filtros.fechaFin)) : d1;
        } else {
          return consolidarPorConcepto ? agruparPorConcepto(d2, formatearFechaLocal(rango2.fechaFin)) : d2;
        }
      }
    }
  };

  const datosVistaPrevia = obtenerDatosVistaPrevia();

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
            <p className="text-sm text-gray-600 mt-1">Genera y exporta reportes con cortes de fecha independientes para horas ordinarias y horas extras</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Configuración del Informe</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Establece los periodos de fechas especializados para cada tipo de horas</p>
            </div>
            
            {/* Selector de Rango de Fechas */}
            {filtros.tipoInforme === 'nominaofima' && (
              <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl border border-gray-200/50 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => handleCambioModoFechas('unico')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    modoFechas === 'unico'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200/40'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Rango Único
                </button>
                <button
                  type="button"
                  onClick={() => handleCambioModoFechas('doble')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    modoFechas === 'doble'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200/40'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Dos Rangos (Ordinarias/Extras)
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-white space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Campo 1: Tipo de informe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Informe</label>
              <Select value={filtros.tipoInforme} onValueChange={(value: TipoInforme) => handleFiltroChange('tipoInforme', value)}>
                <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white h-11">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="nominaofima">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-green-600" /> Exportación Nómina Ofima ERP
                    </div>
                  </SelectItem>
                  <SelectItem value="asistencia">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" /> Resumen con Asistencia
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo 2: Filtro de horas (Ordinarias vs Extras) - Solo Ofima */}
            {filtros.tipoInforme === 'nominaofima' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filtro de Horas</label>
                <Select value={filtroHoras} onValueChange={(value: any) => setFiltroHoras(value)}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white h-11">
                    <SelectValue placeholder="Seleccionar filtro" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="todas">Todas las Horas (Completo)</SelectItem>
                    <SelectItem value="ordinarias">Solo Horas Ordinarias</SelectItem>
                    <SelectItem value="extras">Solo Horas Extras</SelectItem>
                    <SelectItem value="separar">Separar Ordinarias y Extras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campo 3: Estructura de salida - Solo Ofima en Modo Doble */}
            {filtros.tipoInforme === 'nominaofima' && modoFechas === 'doble' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estructura de Salida</label>
                <Select value={tipoSalida} onValueChange={(value: any) => setTipoSalida(value)}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white h-11">
                    <SelectValue placeholder="Seleccionar estructura" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="consolidado">Un solo informe consolidado</SelectItem>
                    <SelectItem value="independiente">Dos informes individuales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campo 4: Modo Excel Independiente - Solo Ofima en Modo Doble Independiente */}
            {filtros.tipoInforme === 'nominaofima' && modoFechas === 'doble' && tipoSalida === 'independiente' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Formato de Excel</label>
                <Select value={modoExcelIndependiente} onValueChange={(value: any) => setModoExcelIndependiente(value)}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white h-11">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="pestanas">1 Archivo Excel (2 Pestañas)</SelectItem>
                    <SelectItem value="archivos">2 Archivos Excel separados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Botón Generar - Para Modo Unico u otros */}
            {!(filtros.tipoInforme === 'nominaofima' && modoFechas === 'doble') && (
              <div className="md:col-span-1"></div>
            )}
            {!(filtros.tipoInforme === 'nominaofima' && modoFechas === 'doble' && tipoSalida === 'independiente') && filtros.tipoInforme === 'nominaofima' && modoFechas === 'doble' && (
              <div className="md:col-span-1"></div>
            )}
            
            {filtros.tipoInforme === 'asistencia' && (
              <div className="md:col-span-2"></div>
            )}

            <Button onClick={handleGenerar} disabled={cargando} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 shadow-sm w-full md:w-auto px-6">
              {cargando ? 'Generando...' : 'Generar Informe'}
            </Button>
          </div>

          {/* Opciones de Agrupación (Checkboxes) - Solo para Ofima */}
          {filtros.tipoInforme === 'nominaofima' && (
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gray-50/40 p-4 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">Formato de Agrupación de Horas:</span>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <CheckboxComponent 
                    checked={detallarPorDia} 
                    onCheckedChange={(checked: any) => handleToggleDetallar(!!checked)} 
                    className="border-gray-300 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    Detallado por Día (Día por Día)
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <CheckboxComponent 
                    checked={consolidarPorConcepto} 
                    onCheckedChange={(checked: any) => handleToggleConsolidar(!!checked)} 
                    className="border-gray-300 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    Consolidado por Concepto (Una Sola Línea con el Total)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Sección Dinámica de Selección de Fechas */}
          {filtros.tipoInforme === 'nominaofima' && modoFechas === 'doble' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-200/50 shadow-inner">
              {/* Rango 1 (Horas Ordinarias) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Rango 1: Horas Ordinarias (ej. 15 al 30 de Mayo)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fecha Inicio</label>
                    <Input type="date" value={filtros.fechaInicio} onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)} className="bg-white border-gray-300 focus:border-blue-500 h-10 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fecha Fin</label>
                    <Input type="date" value={filtros.fechaFin} onChange={(e) => handleFiltroChange('fechaFin', e.target.value)} className="bg-white border-gray-300 focus:border-blue-500 h-10 text-xs" />
                  </div>
                </div>
              </div>

              {/* Rango 2 (Horas Extras) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-purple-600" />
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Rango 2: Horas Extras (ej. 13 al 27 de Mayo)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fecha Inicio</label>
                    <Input type="date" value={rango2.fechaInicio} onChange={(e) => setRango2(prev => ({ ...prev, fechaInicio: e.target.value }))} className="bg-white border-gray-300 focus:border-blue-500 h-10 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fecha Fin</label>
                    <Input type="date" value={rango2.fechaFin} onChange={(e) => setRango2(prev => ({ ...prev, fechaFin: e.target.value }))} className="bg-white border-gray-300 focus:border-blue-500 h-10 text-xs" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Rango Único Standard */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/30 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
                <Input type="date" value={filtros.fechaInicio} onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)} className="bg-white border-gray-300 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
                <Input type="date" value={filtros.fechaFin} onChange={(e) => handleFiltroChange('fechaFin', e.target.value)} className="bg-white border-gray-300 focus:border-blue-500" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados - Vista Previa de Ofima */}
      {filtros.tipoInforme === 'nominaofima' && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building className={`h-5 w-5 ${getTipoColor('nominaofima')}`} />
                Vista Previa - Exportación Nómina Ofima ERP
              </CardTitle>
              {modoFechas === 'doble' && (
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  <span>
                    {tipoSalida === 'consolidado' 
                      ? 'Consolidando Horas Ordinarias (Rango 1) y Horas Extras (Rango 2)' 
                      : `Mostrando ${bloqueVistaPrevia === 1 ? `Horas Ordinarias (Rango: ${filtros.fechaInicio} a ${filtros.fechaFin})` : `Horas Extras (Rango: ${rango2.fechaInicio} a ${rango2.fechaFin})`}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Controles del Bloque de Vista Previa + Descargas */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Toggles de Bloque para Vista Previa en Modo Doble Independiente */}
              {modoFechas === 'doble' && tipoSalida === 'independiente' && (
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg border border-gray-200/50">
                  <button
                    onClick={() => setBloqueVistaPrevia(1)}
                    className={`py-1 px-3 rounded-md text-xs font-semibold transition-all ${
                      bloqueVistaPrevia === 1
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Horas Ordinarias
                  </button>
                  <button
                    onClick={() => setBloqueVistaPrevia(2)}
                    className={`py-1 px-3 rounded-md text-xs font-semibold transition-all ${
                      bloqueVistaPrevia === 2
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Horas Extras
                  </button>
                </div>
              )}

              {/* Botones de Descarga */}
              <div className="flex gap-2">
                <Button 
                  onClick={exportarExcelOfima} 
                  disabled={datosVistaPrevia.length === 0} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300 font-medium h-9 text-xs"
                >
                  <Download className="h-4 w-4" /> Excel
                </Button>
                <Button 
                  onClick={exportarPlanoOfima} 
                  disabled={datosVistaPrevia.length === 0} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium h-9 text-xs"
                >
                  <FileText className="h-4 w-4" /> Plano (TXT)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-white space-y-4">
            {filtroHoras === 'separar' && datosVistaPrevia.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200/50 text-xs">
                <Split className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Nota sobre la exportación:</strong> Has elegido la opción "Separar Ordinarias y Extras". La vista previa muestra todo consolidado, pero al exportar se generarán hojas separadas (en Excel) o archivos separados (en Plano TXT).
                </span>
              </div>
            )}

            <Tabla 
              columnas={["CODCC", "CODIGO", "CONCEP", "FECHA", "GRUPO", "NOTA", "NROHORAS", "VALOR"]}
              datos={datosVistaPrevia.map(row => ({
                "CODCC": row.CODCC,
                "CODIGO": row.CODIGO,
                "CONCEP": (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                    esOrdinaria(row.CONCEP)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {row.CONCEP} {esOrdinaria(row.CONCEP) ? '(Ord.)' : '(Ext.)'}
                  </span>
                ),
                "FECHA": row.FECHA,
                "GRUPO": row.GRUPO,
                "NOTA": row.NOTA,
                "NROHORAS": <span className="font-bold text-gray-900">{row.NROHORAS.toFixed(2)}</span>,
                "VALOR": row.VALOR
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Resultados - Vista Previa de Asistencia */}
      {filtros.tipoInforme === 'asistencia' && (
        <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-gray-100 bg-white">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className={`h-5 w-5 ${getTipoColor('asistencia')}`} />
              Resumen de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-white">
            <div className="flex gap-3">
              <Button onClick={exportarPlanoAsistencia} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm">
                <Download className="h-4 w-4" /> Exportar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
