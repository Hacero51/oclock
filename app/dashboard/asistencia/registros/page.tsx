'use client';

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Tabla from "@/components/Table"; // Ajusta la ruta según donde tengas tu componente

export default function RegistroTiempoForm() {
  const [filtros, setFiltros] = useState({
    empleado: "",
    fecha: "",
    tipo: ""
  });

  // Datos de ejemplo con múltiples empleados
  const registros = [
    {
      empleado: "Johana andrea jimenez rodriguez",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "Johana andrea jimenez rodriguez",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DAGER OCORO RAMIREZ",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "ENILSON ANDRES YEPES VEGA",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "LUZ ESTELA RODRIGUEZ MANCO",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DIANA KATERINE RIAÑO MERCHAN",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "JUAN STEEVEN CAMARGO MORENO",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DARLY DAVID GOMEZ MENDOZA",
      tiempo: "LUNES, 12 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "VICENSIO ANGULO ROJAS",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "BRAYAN STIVEN GUTIERREZ AMORTEGUI",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "Johana andrea jimenez rodriguez",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "Johana andrea jimenez rodriguez",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DAGER OCORO RAMIREZ",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "ENILSON ANDRES YEPES VEGA",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "LUZ ESTELA RODRIGUEZ MANCO",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DIANA KATERINE RIAÑO MERCHAN",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "JUAN STEEVEN CAMARGO MORENO",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DARLY DAVID GOMEZ MENDOZA",
      tiempo: "LUNES, 12 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "VICENSIO ANGULO ROJAS",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "BRAYAN STIVEN GUTIERREZ AMORTEGUI",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },{
      empleado: "Johana andrea jimenez rodriguez",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "Johana andrea jimenez rodriguez",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DAGER OCORO RAMIREZ",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "ENILSON ANDRES YEPES VEGA",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "LUZ ESTELA RODRIGUEZ MANCO",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DIANA KATERINE RIAÑO MERCHAN",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:49 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "JUAN STEEVEN CAMARGO MORENO",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "DARLY DAVID GOMEZ MENDOZA",
      tiempo: "LUNES, 12 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "VICENSIO ANGULO ROJAS",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    },
    {
      empleado: "BRAYAN STIVEN GUTIERREZ AMORTEGUI",
      tiempo: "LUNES, 10 DE NOVIEMBRE DE 2025 5:48 A. M.",
      tipo: "Entrada",
      año: 2025,
      mes: 11,
      metodoverificacion: "Huella",
      lector: "mosquera",
    }
  ];

  const empleados = Array.from(new Set(registros.map(r => r.empleado)));

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para extraer la fecha del campo tiempo y formatearla para comparar
  const extraerFechaDeTiempo = (tiempo: string) => {
    // Convertir "LUNES, 10 DE NOVIEMBRE DE 2025 5:50 A. M." a formato fecha
    const partes = tiempo.split(' ');
    if (partes.length >= 6) {
      const dia = partes[1]; // 10
      const mes = partes[3]; // NOVIEMBRE
      const año = partes[5]; // 2025
      
      // Convertir mes español a número
      const meses: Record<string, string> = {
        'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
        'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
        'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
      };
      
      const mesNumero = meses[mes] || '01';
      return `${año}-${mesNumero}-${dia.padStart(2, '0')}`;
    }
    return '';
  };

  const registrosFiltrados = registros.filter(registro => {
    const coincideEmpleado = !filtros.empleado || filtros.empleado === "all" || registro.empleado === filtros.empleado;
    const coincideTipo = !filtros.tipo || filtros.tipo === "all" || registro.tipo === filtros.tipo;
    
    // Filtrar por fecha si se ha seleccionado una
    let coincideFecha = true;
    if (filtros.fecha) {
      const fechaRegistro = extraerFechaDeTiempo(registro.tiempo);
      coincideFecha = fechaRegistro === filtros.fecha;
    }
    
    return coincideEmpleado && coincideTipo && coincideFecha;
  });

  // 🎯 PREPARAR DATOS PARA LA TABLA ESTANDARIZADA
  const datosParaTabla = registrosFiltrados.map((registro) => ({
    'Empleado': registro.empleado,
    'Tiempo': registro.tiempo,
    'Tipo': (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        registro.tipo === "Entrada" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {registro.tipo}
      </span>
    ),
    'Año': registro.año,
    'Mes': registro.mes,
    'Método de Verificación': (
      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
        {registro.metodoverificacion}
      </span>
    ),
    'Lector': registro.lector
  }));

  const columnasTabla = [
    'Empleado', 
    'Tiempo', 
    'Tipo', 
    'Año', 
    'Mes', 
    'Método de Verificación', 
    'Lector'
  ];

  // Función para manejar el click en una fila
  const manejarClickFila = (fila: any) => {
    console.log('Fila clickeada:', fila);
    // Aquí puedes agregar lógica para editar, ver detalles, etc.
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-9xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registro de Tiempo</h1>
          <p className="text-gray-600">Consulta de registros de asistencia</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado
              </label>
              <Select 
                value={filtros.empleado} 
                onValueChange={(value) => handleFiltroChange("empleado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {empleados.map((empleado) => (
                    <SelectItem key={empleado} value={empleado}>
                      {empleado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <Input
                type="date"
                value={filtros.fecha}
                onChange={(e) => handleFiltroChange("fecha", e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <Select 
                value={filtros.tipo} 
                onValueChange={(value) => handleFiltroChange("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                Buscar
              </Button>
              <Button 
                variant="outline"
                onClick={() => setFiltros({ empleado: "", fecha: "", tipo: "" })}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla Estándar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {datosParaTabla.length > 0 ? (
            <Tabla 
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={manejarClickFila}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron registros con los filtros aplicados
            </div>
          )}

          {/* Footer de la tabla */}
          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Mostrando {registrosFiltrados.length} de {registros.length} registros</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Exportar Excel
                </Button>
                <Button variant="outline" size="sm">
                  Imprimir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}