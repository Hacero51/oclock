'use client';

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Tabla from "@/components/Table";

// Componente de controles de paginación local
function PaginationControls({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600">
          No hay marcaciones para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} marcaciones
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600 mx-2">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
          Registros por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

// Función para convertir formato nativo a formato legible
const formatearFechaHora = (fechaHoraString: string) => {
  if (!fechaHoraString) return "";
  
  const fecha = new Date(fechaHoraString);
  
  // Días de la semana en español
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  
  // Meses en español
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  const diaSemana = diasSemana[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  
  let horas = fecha.getHours();
  let minutos = fecha.getMinutes();
  const ampm = horas >= 12 ? 'P. M.' : 'A. M.';
  
  // Convertir a formato 12 horas
  horas = horas % 12;
  horas = horas ? horas : 12; // 0 debería ser 12
  
  const minutosStr = minutos.toString().padStart(2, '0');
  
  return `${diaSemana}, ${dia} DE ${mes} DE ${año} ${horas}:${minutosStr} ${ampm}`;
};

// Función para convertir formato legible a formato nativo (para edición)
const parsearFechaHora = (fechaHoraLegible: string) => {
  if (!fechaHoraLegible) return "";
  
  try {
    // Ejemplo: "DOMINGO, 9 DE NOVIEMBRE DE 2025 6:15 A. M."
    const partes = fechaHoraLegible.split(' ');
    const dia = parseInt(partes[1]);
    const mes = partes[3];
    const año = parseInt(partes[5]);
    const horaMinuto = partes[6];
    const ampm = partes[7] + (partes[8] ? ' ' + partes[8] : '');
    
    const meses: Record<string, number> = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3,
      'MAYO': 4, 'JUNIO': 5, 'JULIO': 6, 'AGOSTO': 7,
      'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };
    
    const [horaStr, minutoStr] = horaMinuto.split(':');
    let hora = parseInt(horaStr);
    const minuto = parseInt(minutoStr);
    
    // Convertir a formato 24 horas
    if (ampm.includes('P. M.') && hora < 12) hora += 12;
    if (ampm.includes('A. M.') && hora === 12) hora = 0;
    
    const fecha = new Date(año, meses[mes], dia, hora, minuto);
    return fecha.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
  } catch (error) {
    return "";
  }
};

// Función para obtener la fecha actual en formato YYYY-MM-DDTHH:MM
const obtenerFechaActual = () => {
  const ahora = new Date();
  return ahora.toISOString().slice(0, 16);
};

// Función para obtener la fecha mínima basada en la entrada
const obtenerFechaMinima = (entrada: string) => {
  if (!entrada) return undefined;
  
  const fechaEntrada = parsearFechaHora(entrada);
  if (!fechaEntrada) return undefined;
  
  return fechaEntrada;
};

// Función para validar la fecha de salida - CORREGIDA
const validarSalida = (salida: string, entrada: string, marcacion: any) => {
  if (!salida) return { valido: false, mensaje: "La salida no puede estar vacía" };
  
  const fechaSalida = new Date(salida);
  const fechaEntrada = parsearFechaHora(entrada) ? new Date(parsearFechaHora(entrada)) : null;
  const fechaActual = new Date();
  
  // Validar que la salida no sea inferior a la entrada
  if (fechaEntrada && fechaSalida < fechaEntrada) {
    return { 
      valido: false, 
      mensaje: "La salida no puede ser anterior a la entrada" 
    };
  }
  
  // CORRECCIÓN: Validar que la salida no sea posterior al día actual CON HORAS
  // Esto evita que se pongan fechas futuras
  if (fechaSalida > fechaActual) {
    return { 
      valido: false, 
      mensaje: "La salida no puede ser posterior a la fecha y hora actual" 
    };
  }
  
  // Validar que la salida no sea demasiado antigua (más de 30 días)
  const diferenciaDias = (fechaActual.getTime() - fechaSalida.getTime()) / (1000 * 60 * 60 * 24);
  if (diferenciaDias > 30) {
    return { 
      valido: false, 
      mensaje: "No se pueden registrar salidas con más de 30 días de antigüedad" 
    };
  }
  
  // Asegurar que la salida sea del MISMO DÍA que la entrada
  if (fechaEntrada) {
    const mismoDia = fechaSalida.getDate() === fechaEntrada.getDate() &&
                    fechaSalida.getMonth() === fechaEntrada.getMonth() &&
                    fechaSalida.getFullYear() === fechaEntrada.getFullYear();
    
    if (!mismoDia) {
      return {
        valido: false,
        mensaje: "La salida debe ser del mismo día que la entrada"
      };
    }
  }
  
  return { valido: true, mensaje: "" };
};

type Marcacion = {
  [key: string]: any;
  id: string;
  empleado: string;
  turno: string;
  fecha: string;
  entrada: string;
  salida: string;
  iniciaTurno: boolean;
  tiempoExtraDespues: boolean;
  tiempoExtraFestivo: boolean;
  autorizar: boolean;
  estado: string;
};

export default function FormMarcaciones() {
  const [filtros, setFiltros] = useState({
    empleado: "",
    turno: "",
    estado: "",
  });

  // Estado para datos y paginación
  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salidaEditada, setSalidaEditada] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");

  // Estado para edición de checkboxes
  const [editandoCheckbox, setEditandoCheckbox] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  // Simular carga de datos
  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      // Datos de ejemplo CORREGIDOS - sin errores de fechas
      const datosEjemplo: Marcacion[] = [
        {
          id: "1",
          empleado: "MARIA ALEJANDRA AGUILAR MORALES",
          turno: "OFICINA - EXTRAS",
          fecha: "9/11/2025",
          entrada: "DOMINGO, 9 DE NOVIEMBRE DE 2025 6:15 A. M.",
          salida: "DOMINGO, 9 DE NOVIEMBRE DE 2025 10:20 P. M.",
          iniciaTurno: false,
          tiempoExtraDespues: true,
          tiempoExtraFestivo: false,
          autorizar: false,
          estado: "OK",
        },
        {
          id: "2",
          empleado: "YESENIA MARGARITA ZÚÑIGA MENDOZA",
          turno: "PLANTA 6 AM - 2 PM",
          fecha: "8/11/2025",
          entrada: "SÁBADO, 8 DE NOVIEMBRE DE 2025 10:23 A. M.",
          salida: "",
          iniciaTurno: true,
          tiempoExtraDespues: false,
          tiempoExtraFestivo: false,
          autorizar: false,
          estado: "Incompleto",
        },
        {
          id: "3",
          empleado: "HANS STACY ACRONIE HERNANDEZ",
          turno: "OFICINA - EXTRAS",
          fecha: "8/11/2025",
          entrada: "SÁBADO, 8 DE NOVIEMBRE DE 2025 7:35 A. M.",
          salida: "SÁBADO, 8 DE NOVIEMBRE DE 2025 11:00 A. M.",
          iniciaTurno: true,
          tiempoExtraDespues: true,
          tiempoExtraFestivo: true,
          autorizar: false,
          estado: "OK",
        },
        // Datos adicionales para pruebas
        {
          id: "4",
          empleado: "CARLOS ALBERTO RAMIREZ LOPEZ",
          turno: "PLANTA 2 PM - 10 PM",
          fecha: "10/11/2025",
          entrada: "LUNES, 10 DE NOVIEMBRE DE 2025 2:00 P. M.",
          salida: "LUNES, 10 DE NOVIEMBRE DE 2025 10:15 P. M.",
          iniciaTurno: true,
          tiempoExtraDespues: false,
          tiempoExtraFestivo: false,
          autorizar: true,
          estado: "OK",
        },
        {
          id: "5",
          empleado: "ANA ISABEL GUTIERREZ CASTRO",
          turno: "OFICINA - EXTRAS",
          fecha: "10/11/2025",
          entrada: "LUNES, 10 DE NOVIEMBRE DE 2025 8:00 A. M.",
          salida: "",
          iniciaTurno: false,
          tiempoExtraDespues: false,
          tiempoExtraFestivo: false,
          autorizar: false,
          estado: "Incompleto",
        }
      ];
      
      setMarcaciones(datosEjemplo);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMounted]);

  // Aplicar filtros
  const marcacionesFiltradas = useMemo(() => {
    let filtered = marcaciones;

    if (filtros.empleado && filtros.empleado !== "all") {
      filtered = filtered.filter(marcacion => marcacion.empleado === filtros.empleado);
    }

    if (filtros.turno && filtros.turno !== "all") {
      filtered = filtered.filter(marcacion => marcacion.turno === filtros.turno);
    }

    if (filtros.estado && filtros.estado !== "all") {
      filtered = filtered.filter(marcacion => marcacion.estado === filtros.estado);
    }

    return filtered;
  }, [marcaciones, filtros.empleado, filtros.turno, filtros.estado]);

  // Datos paginados
  const marcacionesPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return marcacionesFiltradas.slice(startIndex, startIndex + itemsPerPage);
  }, [marcacionesFiltradas, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtros.empleado, filtros.turno, filtros.estado]);

  // Empleados y turnos para los selects
  const empleados = useMemo(
    () => Array.from(new Set(marcaciones.map(m => m.empleado))),
    [marcaciones]
  );

  const turnos = useMemo(
    () => Array.from(new Set(marcaciones.map(m => m.turno))),
    [marcaciones]
  );

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpieza de filtros
  const handleClearAllFilters = () => {
    setFiltros({ empleado: "", turno: "", estado: "" });
    setCurrentPage(1);
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Iniciar edición de salida
  const iniciarEdicionSalida = (marcacion: Marcacion) => {
    if (marcacion.estado === "Incompleto" || !marcacion.salida) {
      setEditandoId(marcacion.id);
      
      // Si ya existe una salida, usar esa, sino usar la fecha actual como predeterminado
      const salidaInicial = marcacion.salida 
        ? parsearFechaHora(marcacion.salida)
        : obtenerFechaActual();
      
      setSalidaEditada(salidaInicial);
      setErrorValidacion("");
    }
  };

  // Validar en tiempo real mientras se edita
  const handleSalidaChange = (nuevaSalida: string, marcacion: Marcacion) => {
    setSalidaEditada(nuevaSalida);
    
    if (nuevaSalida) {
      const validacion = validarSalida(nuevaSalida, marcacion.entrada, marcacion);
      setErrorValidacion(validacion.valido ? "" : validacion.mensaje);
    } else {
      setErrorValidacion("");
    }
  };

  // Guardar salida editada
  const guardarSalida = (marcacion: Marcacion) => {
    if (!salidaEditada) {
      setErrorValidacion("La salida no puede estar vacía");
      return;
    }

    const validacion = validarSalida(salidaEditada, marcacion.entrada, marcacion);
    
    if (!validacion.valido) {
      setErrorValidacion(validacion.mensaje);
      return;
    }

    const nuevaSalidaFormateada = formatearFechaHora(salidaEditada);
    
    setMarcaciones(prev => prev.map(m => 
      m.id === marcacion.id 
        ? { 
            ...m, 
            salida: nuevaSalidaFormateada,
            estado: "OK" // Cambiar a OK cuando se complete la salida
          } 
        : m
    ));
    
    setEditandoId(null);
    setSalidaEditada("");
    setErrorValidacion("");
  };

  // Cancelar edición de salida
  const cancelarEdicion = () => {
    setEditandoId(null);
    setSalidaEditada("");
    setErrorValidacion("");
  };

  // Manejar cambio de checkbox
  const handleCheckboxChange = (marcacionId: string, campo: string, valor: boolean) => {
    setMarcaciones(prev => prev.map(m => 
      m.id === marcacionId 
        ? { ...m, [campo]: valor }
        : m
    ));
  };

  // Iniciar edición de checkbox
  const iniciarEdicionCheckbox = (marcacionId: string) => {
    setEditandoCheckbox(marcacionId);
  };

  // Finalizar edición de checkbox
  const finalizarEdicionCheckbox = () => {
    setEditandoCheckbox(null);
  };

  // Preparar datos para la tabla
  const datosParaTabla = useMemo(() => {
    return marcacionesPaginadas.map((marcacion) => ({
      'Empleado': marcacion.empleado,
      'Turno': marcacion.turno,
      'Fecha': marcacion.fecha,
      'Entrada': marcacion.entrada,
      'Salida': editandoId === marcacion.id ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={salidaEditada}
              onChange={(e) => handleSalidaChange(e.target.value, marcacion)}
              className="w-48"
              max={obtenerFechaActual()} // Limitar al día actual
              min={obtenerFechaMinima(marcacion.entrada)} // Mínimo desde la entrada
            />
            <div className="flex gap-1">
              <Button 
                size="sm" 
                onClick={() => guardarSalida(marcacion)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!!errorValidacion}
              >
                ✓
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={cancelarEdicion}
              >
                ✗
              </Button>
            </div>
          </div>
          {errorValidacion && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {errorValidacion}
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`cursor-pointer p-2 rounded border ${
            (marcacion.estado === "Incompleto" || !marcacion.salida) 
              ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" 
              : "text-gray-700 border-gray-200"
          }`}
          onClick={() => iniciarEdicionSalida(marcacion)}
          title={marcacion.estado === "Incompleto" ? "Click para editar salida" : "Salida completa"}
        >
          {marcacion.salida || "--- SIN SALIDA ---"}
        </div>
      ),
      'Inicia Turno': (
        <div 
          className="flex justify-center cursor-pointer p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-50"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
          title="Click para editar"
        >
          <Checkbox 
            checked={marcacion.iniciaTurno} 
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'iniciaTurno', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button 
              size="sm" 
              variant="ghost"
              className="ml-1 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
            >
              ✓
            </Button>
          )}
        </div>
      ),
      'Tiempo Extra Después': (
        <div 
          className="flex justify-center cursor-pointer p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-50"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
          title="Click para editar"
        >
          <Checkbox 
            checked={marcacion.tiempoExtraDespues} 
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'tiempoExtraDespues', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button 
              size="sm" 
              variant="ghost"
              className="ml-1 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
            >
              ✓
            </Button>
          )}
        </div>
      ),
      'Tiempo Extra Festivo': (
        <div 
          className="flex justify-center cursor-pointer p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-50"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
          title="Click para editar"
        >
          <Checkbox 
            checked={marcacion.tiempoExtraFestivo} 
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'tiempoExtraFestivo', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button 
              size="sm" 
              variant="ghost"
              className="ml-1 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
            >
              ✓
            </Button>
          )}
        </div>
      ),
      'Autorizar': (
        <div 
          className="flex justify-center cursor-pointer p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-50"
          onClick={() => iniciarEdicionCheckbox(marcacion.id)}
          title="Click para editar"
        >
          <Checkbox 
            checked={marcacion.autorizar} 
            onCheckedChange={(checked) => handleCheckboxChange(marcacion.id, 'autorizar', checked === true)}
            disabled={editandoCheckbox !== marcacion.id}
          />
          {editandoCheckbox === marcacion.id && (
            <Button 
              size="sm" 
              variant="ghost"
              className="ml-1 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                finalizarEdicionCheckbox();
              }}
            >
              ✓
            </Button>
          )}
        </div>
      ),
      'Estado': (
        <div className="flex justify-center">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              marcacion.estado === "OK"
                ? "bg-green-100 text-green-800"
                : marcacion.estado === "Incompleto"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {marcacion.estado}
          </span>
        </div>
      )
    }));
  }, [marcacionesPaginadas, editandoId, salidaEditada, errorValidacion, editandoCheckbox]);

  const columnasTabla = [
    'Empleado', 
    'Turno', 
    'Fecha', 
    'Entrada', 
    'Salida', 
    'Inicia Turno', 
    'Tiempo Extra Después', 
    'Tiempo Extra Festivo', 
    'Autorizar', 
    'Estado'
  ];

  const totalPages = Math.ceil(marcacionesFiltradas.length / itemsPerPage);

  if (!isMounted) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">⏰ Marcaciones</h1>
          <p className="text-sm text-gray-600 mt-1">
            {marcacionesFiltradas.length} registros encontrados
            {marcacionesFiltradas.length !== marcaciones.length && ` (filtrados de ${marcaciones.length} totales)`}
          </p>
        </div>

        <div className="flex gap-2">
          {(filtros.empleado || filtros.turno || filtros.estado) && (
            <Button
              variant="outline"
              className="text-gray-600"
              onClick={handleClearAllFilters}
            >
              Limpiar Filtros
            </Button>
          )}

          <Button
            variant="outline"
            className="border-green-500 text-green-600"
            onClick={() => console.log('Exportar')}
          >
            📤 Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
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
              Turno
            </label>
            <Select
              value={filtros.turno}
              onValueChange={(value) => handleFiltroChange("turno", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los turnos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los turnos</SelectItem>
                {turnos.map((turno) => (
                  <SelectItem key={turno} value={turno}>
                    {turno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => handleFiltroChange("estado", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="Incompleto">Incompleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              onClick={() => console.log('Buscar')}
            >
              🔍 Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla con paginación */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Tabla */}
        <div className="overflow-x-auto">
          {datosParaTabla.length > 0 ? (
            <Tabla 
              columnas={columnasTabla}
              datos={datosParaTabla}
              onRowClick={() => {}} // No necesitamos click en fila completa
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron marcaciones
              </h3>
              <p className="text-gray-500 mb-4">
                {marcaciones.length === 0 
                  ? "No hay marcaciones en el sistema." 
                  : "No hay marcaciones que coincidan con los filtros aplicados."
                }
              </p>
              {(filtros.empleado || filtros.turno || filtros.estado) && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                >
                  Limpiar todos los filtros
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Controles de paginación */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={marcacionesFiltradas.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}