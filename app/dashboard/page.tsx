'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Clock, Calendar, Target, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

// ---------------- INTERFACES ---------------- //
interface DashboardData {
  cumplimientoPorDepartamento: { departamento: string; cumplimiento: number; empleados: number; }[];
  retrasosPorTurno: { turno: string; retrasos: number; total: number; tasa?: number; }[];
  marcacionesHoy: { puntuales: number; retrasos: number; ausentes: number; total: number; };
  metricasGenerales: { totalEmpleados: number; activosHoy: number; promedioCumplimiento: number; incidenciasMes: number; };
  tendencia?: { label: string; valor: number; }[];
  alertas?: { tipo: 'warning' | 'info' | 'success'; titulo: string; mensaje: string; }[];
}

// Datos de ejemplo para las gráficas
const datosEjemplo: DashboardData = {
  cumplimientoPorDepartamento: [
    { departamento: 'Administración', cumplimiento: 95, empleados: 12 },
    { departamento: 'Producción', cumplimiento: 78, empleados: 45 },
    { departamento: 'Ventas', cumplimiento: 88, empleados: 18 },
    { departamento: 'TI', cumplimiento: 92, empleados: 8 },
    { departamento: 'RH', cumplimiento: 96, empleados: 6 },
  ],
  retrasosPorTurno: [
    { turno: 'Mañana (6AM-2PM)', retrasos: 12, total: 45 },
    { turno: 'Tarde (2PM-10PM)', retrasos: 8, total: 38 },
    { turno: 'Noche (10PM-6AM)', retrasos: 5, total: 22 },
  ],
  marcacionesHoy: {
    puntuales: 89,
    retrasos: 15,
    ausentes: 6,
    total: 110
  },
  metricasGenerales: {
    totalEmpleados: 125,
    activosHoy: 104,
    promedioCumplimiento: 87,
    incidenciasMes: 42
  },
  tendencia: [],
  alertas: []
};

export default function DashboardPage() {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('today');

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

  // Componente de gráfica de barras simple
  const GraficaBarras = ({ datos, color = "bg-blue-500" }: { datos: any[]; color?: string }) => (
    <div className="flex items-end justify-between h-32 gap-1 pt-4">
      {datos.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 mb-1 text-center">{item.label}</div>
          <div
            className={`w-full ${color} rounded-t transition-all duration-500`}
            style={{ height: `${item.valor}%` }}
          />
          <div className="text-xs font-medium mt-1">{item.valor}%</div>
        </div>
      ))}
    </div>
  );

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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Puntuales</span>
                <span className="font-bold text-green-600">
                  {datos.marcacionesHoy.puntuales}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Retrasos</span>
                <span className="font-bold text-yellow-600">
                  {datos.marcacionesHoy.retrasos}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ausentes</span>
                <span className="font-bold text-red-600">
                  {datos.marcacionesHoy.ausentes}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="font-bold text-gray-900">
                    {datos.marcacionesHoy.total}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de Cumplimiento Mensual */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl lg:col-span-2">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Tendencia de Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <GraficaBarras
              datos={(datos as any).tendencia || []}
              color="bg-purple-500"
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