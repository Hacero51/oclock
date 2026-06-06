'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Clock, Calendar, Target, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

// ---------------- INTERFACES ---------------- //
interface TrendData {
  label: string;
  valor: number;
}

interface EmployeeDetail {
  nombre: string;
  departamento: string;
  turno: string;
}

interface DashboardData {
  cumplimientoPorDepartamento: { departamento: string; cumplimiento: number; empleados: number; }[];
  retrasosPorTurno: { turno: string; retrasos: number; total: number; tasa?: number; }[];
  marcacionesHoy: { puntuales: number; retrasos: number; ausentes: number; total: number; };
  metricasGenerales: { totalEmpleados: number; activosHoy: number; promedioCumplimiento: number; incidenciasMes: number; };
  tendencia?: {
    semana: TrendData[];
    quincena: TrendData[];
    mes: TrendData[];
  };
  alertas?: { tipo: 'warning' | 'info' | 'success'; titulo: string; mensaje: string; }[];
  detallesHoy?: {
    puntuales: EmployeeDetail[];
    retrasos: EmployeeDetail[];
    ausentes: EmployeeDetail[];
  };
}


export default function DashboardPage() {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('today');
  const [periodoTendencia, setPeriodoTendencia] = useState<'semana' | 'quincena' | 'mes'>('semana');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<'puntuales' | 'retrasos' | 'ausentes'>('puntuales');

  const fetchStats = async (p: string) => {
    try {
      setCargando(true);
      const response = await fetch(`/api/dashboard/stats?period=${p}`);
      if (!response.ok) throw new Error("Error fetching dashboard statistics");
      const data = await response.json();
      setDatos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las estadísticas reales.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchStats(periodo);
  }, [periodo]);

  // Componente de barra de progreso para cumplimiento
  const BarraProgreso = ({ porcentaje, color = "bg-blue-500" }: { porcentaje: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );

  // Componente de gráfica de línea SVG premium e interactiva
  const GraficaLinea = ({ datos }: { datos: TrendData[] }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!datos || datos.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400 italic text-xs">
          No hay datos de tendencia disponibles
        </div>
      );
    }

    const width = 600;
    const height = 220;
    const paddingTop = 20;
    const paddingBottom = 30;
    const paddingLeft = 35;
    const paddingRight = 15;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const N = datos.length;

    const points = datos.map((item, i) => {
      const x = paddingLeft + (N > 1 ? (i * chartWidth) / (N - 1) : chartWidth / 2);
      const y = paddingTop + chartHeight - (item.valor / 100) * chartHeight;
      return { x, y };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = N > 0 ? `${pathD} L ${points[N - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z` : '';

    const labelStep = N <= 7 ? 1 : N <= 15 ? 2 : 5;

    return (
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grilla horizontal y etiquetas del eje Y */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-gray-400 font-medium font-sans"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Área con gradiente debajo de la línea */}
          {N > 0 && (
            <path
              d={areaD}
              fill="url(#chartGradient)"
              className="transition-all duration-500 ease-in-out"
            />
          )}

          {/* Línea de tendencia */}
          {N > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-in-out"
            />
          )}

          {/* Círculos de datos e interacción */}
          {points.map((p, i) => (
            <g key={i}>
              {(N <= 15 || hoveredIndex === i) && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? 5 : 3.5}
                  className={`fill-white stroke-purple-600 transition-all duration-200 ${
                    hoveredIndex === i ? 'stroke-[2.5px] scale-125' : 'stroke-[2px]'
                  }`}
                />
              )}

              {/* Área interactiva vertical */}
              <rect
                x={p.x - (chartWidth / (N - 1 || 1)) / 2}
                y={paddingTop}
                width={chartWidth / (N - 1 || 1)}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {/* Etiquetas del eje X */}
          {datos.map((item, i) => {
            const p = points[i];
            const shouldShowLabel = i === 0 || i === N - 1 || i % labelStep === 0;
            if (!shouldShowLabel) return null;

            return (
              <text
                key={i}
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[9px] fill-gray-400 font-medium font-sans"
              >
                {item.label}
              </text>
            );
          })}

          {/* Overlay del Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g className="pointer-events-none">
              {/* Línea guía vertical */}
              <line
                x1={points[hoveredIndex].x}
                y1={paddingTop}
                x2={points[hoveredIndex].x}
                y2={paddingTop + chartHeight}
                stroke="#D8B4FE"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Ripple de foco */}
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="8"
                className="fill-purple-200 stroke-purple-600 stroke-[1.5px] opacity-60 animate-pulse"
              />
              {/* Punto activo */}
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="5.5"
                className="fill-purple-600 stroke-white stroke-[2px] shadow-md"
              />
              {/* Contenedor del Tooltip */}
              <g transform={`translate(${Math.max(50, Math.min(width - 50, points[hoveredIndex].x))}, ${points[hoveredIndex].y - 32})`}>
                <rect
                  x="-40"
                  y="-10"
                  width="80"
                  height="22"
                  rx="6"
                  className="fill-gray-900 filter drop-shadow-sm opacity-95"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  className="text-[9px] font-semibold fill-white font-sans"
                >
                  {datos[hoveredIndex].valor}%
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    );
  };

  if (cargando || !datos) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-semibold text-sm">Cargando estadísticas en tiempo real...</p>
          <p className="text-xs text-gray-400 mt-1">Conectando con el motor de base de datos de marcaciones</p>
        </div>
      </div>
    );
  }

  if (error && !datos) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-center max-w-sm w-full bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-500 text-xs mb-5">{error}</p>
          <Button onClick={() => fetchStats(periodo)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2">
            Reintentar Carga
          </Button>
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
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bienvenido al dashboard principal de En Punto
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Semana' },
              { id: 'month', label: 'Mes' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPeriodo(btn.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  periodo === btn.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hoy:</span>
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Empleados</div>
                <div className="text-2xl font-bold text-gray-900">
                  {datos.metricasGenerales.totalEmpleados}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Activos Hoy</div>
                <div className="text-2xl font-bold text-gray-900">
                  {datos.metricasGenerales.activosHoy}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Cumplimiento</div>
                <div className="text-2xl font-bold text-gray-900">
                  {datos.metricasGenerales.promedioCumplimiento}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Incidencias Mes</div>
                <div className="text-2xl font-bold text-gray-900">
                  {datos.metricasGenerales.incidenciasMes}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas y Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumplimiento por Departamento */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Cumplimiento por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {datos.cumplimientoPorDepartamento.map((depto, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {depto.departamento}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {depto.cumplimiento}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({depto.empleados} emp.)
                    </span>
                  </div>
                </div>
                <BarraProgreso 
                  porcentaje={depto.cumplimiento} 
                  color={
                    depto.cumplimiento >= 90 ? "bg-green-500" :
                    depto.cumplimiento >= 80 ? "bg-blue-500" :
                    depto.cumplimiento >= 70 ? "bg-yellow-500" : "bg-red-500"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Retrasos por Turno */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Retrasos por Turno
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {datos.retrasosPorTurno.map((turno, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{turno.turno}</div>
                    <div className="text-sm text-gray-500">
                      {turno.retrasos} retrasos de {turno.total} empleados
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      (turno.retrasos / turno.total) * 100 > 20 ? 'text-red-600' : 
                      (turno.retrasos / turno.total) * 100 > 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {Math.round((turno.retrasos / turno.total) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">tasa retraso</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas del Día */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Marcaciones de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div 
                onClick={() => setCategoriaSeleccionada('puntuales')}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                  categoriaSeleccionada === 'puntuales' 
                    ? 'bg-green-50 text-green-700 font-semibold border-l-4 border-green-500 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-sm">Puntuales</span>
                <span className={`font-bold ${categoriaSeleccionada === 'puntuales' ? 'text-green-700' : 'text-green-600'}`}>
                  {datos.marcacionesHoy.puntuales}
                </span>
              </div>
              <div 
                onClick={() => setCategoriaSeleccionada('retrasos')}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                  categoriaSeleccionada === 'retrasos' 
                    ? 'bg-yellow-50 text-yellow-800 font-semibold border-l-4 border-yellow-500 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-sm">Retrasos</span>
                <span className={`font-bold ${categoriaSeleccionada === 'retrasos' ? 'text-yellow-800' : 'text-yellow-600'}`}>
                  {datos.marcacionesHoy.retrasos}
                </span>
              </div>
              <div 
                onClick={() => setCategoriaSeleccionada('ausentes')}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                  categoriaSeleccionada === 'ausentes' 
                    ? 'bg-red-50 text-red-700 font-semibold border-l-4 border-red-500 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-sm">Ausentes</span>
                <span className={`font-bold ${categoriaSeleccionada === 'ausentes' ? 'text-red-700' : 'text-red-600'}`}>
                  {datos.marcacionesHoy.ausentes}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center p-2 text-gray-700 font-medium">
                  <span className="text-sm">Total</span>
                  <span className="font-bold text-gray-900">
                    {datos.marcacionesHoy.total}
                  </span>
                </div>
              </div>

              {/* Listado de Empleados según Selección */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Listado: {categoriaSeleccionada === 'puntuales' ? 'Puntuales' : categoriaSeleccionada === 'retrasos' ? 'Retrasos' : 'Ausentes'}
                  </h4>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">
                    {(datos.detallesHoy?.[categoriaSeleccionada] || []).length} registros
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 font-bold">Nombre</th>
                        <th className="px-3 py-2 font-bold">Depto</th>
                        <th className="px-3 py-2 font-bold">Turno</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(datos.detallesHoy?.[categoriaSeleccionada] || []).length > 0 ? (
                        (datos.detallesHoy?.[categoriaSeleccionada] || []).map((emp, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-3 py-1.5 font-medium text-gray-900 max-w-[120px] truncate" title={emp.nombre}>
                              {emp.nombre}
                            </td>
                            <td className="px-3 py-1.5 text-gray-500 truncate max-w-[100px]" title={emp.departamento}>
                              {emp.departamento}
                            </td>
                            <td className="px-3 py-1.5 text-gray-500 truncate max-w-[90px]" title={emp.turno}>
                              {emp.turno}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-3 py-8 text-center text-gray-400 italic text-[11px]">
                            No hay empleados en esta categoría
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de Cumplimiento Mensual */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl lg:col-span-2">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Tendencia de Cumplimiento
            </CardTitle>
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              {[
                { id: 'semana', label: 'Esta Semana' },
                { id: 'quincena', label: 'Esta Quincena' },
                { id: 'mes', label: 'Este Mes' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setPeriodoTendencia(btn.id as any)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    periodoTendencia === btn.id
                      ? 'bg-white text-purple-700 shadow-sm border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <GraficaLinea
              datos={datos.tendencia?.[periodoTendencia] || []}
            />
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Recomendaciones */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {(datos.alertas || []).map((alerta, index) => {
              const colorMap = {
                warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800', msg: 'text-yellow-700', icon: <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" /> },
                info: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', msg: 'text-blue-700', icon: <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" /> },
                success: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800', msg: 'text-green-700', icon: <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> }
              };
              const c = colorMap[alerta.tipo] || colorMap.info;
              return (
                <div key={index} className={`flex items-center gap-3 p-3 ${c.bg} rounded-lg border ${c.border}`}>
                  {c.icon}
                  <div className="text-sm">
                    <span className={`font-medium ${c.title}`}>{alerta.titulo}</span>
                    <span className={c.msg}> {alerta.mensaje}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}