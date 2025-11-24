'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Fingerprint, RefreshCcw, Wifi, WifiOff, MoreVertical, Download, Power, PowerOff } from "lucide-react";
import Tabla from "@/components/Table";
import { useState, useEffect, useRef } from "react";

export default function DispositivosPage() {
  const [dispositivos, setDispositivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const menuRefs = useRef({});

  // Datos de ejemplo
  const datosEjemplo = [
    {
      id: 3,
      nombre: "PRESADOS INR",
      ultimaDescarga: "LUNES, 10 DE NOVIEMBRE DE 2025 4:11 P. M.",
      estado: "Desconectado",
      ip: "192.168.1.100",
      puerto: 4370,
      ultimaSincronizacion: "2025-11-10T16:11:00Z"
    },
    {
      id: 9,
      nombre: "MOSQUERA NUEVO",
      ultimaDescarga: "MIÉRCOLES, 24 DE ENERO DE 2024 7:02 A. M.",
      estado: "Desconectado",
      ip: "192.168.1.101",
      puerto: 4370,
      ultimaSincronizacion: "2024-01-24T07:02:00Z"
    },
    {
      id: 89,
      nombre: "MOSQUERA",
      ultimaDescarga: "LUNES, 10 DE NOVIEMBRE DE 2025 4:07 P. M.",
      estado: "Desconectado",
      ip: "192.168.1.102",
      puerto: 4370,
      ultimaSincronizacion: "2025-11-10T16:07:00Z"
    },
  ];

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = Object.values(menuRefs.current).every(ref => 
        ref && !ref.contains(event.target)
      );
      
      if (isOutside) {
        setMenuAbierto(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simular carga de datos
  useEffect(() => {
    const cargarDispositivos = async () => {
      try {
        setCargando(true);
        setTimeout(() => {
          setDispositivos(datosEjemplo);
          setCargando(false);
        }, 1000);
      } catch (error) {
        console.error('Error cargando dispositivos:', error);
        setDispositivos(datosEjemplo);
        setCargando(false);
      }
    };

    cargarDispositivos();
  }, []);

  // Función para sincronizar dispositivos
  const sincronizarDispositivos = async () => {
    try {
      setSincronizando(true);
      
      setTimeout(() => {
        const dispositivosActualizados = dispositivos.map(disp => ({
          ...disp,
          ultimaDescarga: new Date().toLocaleString('es-ES', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }).toUpperCase(),
          estado: Math.random() > 0.5 ? "Conectado" : "Desconectado"
        }));
        
        setDispositivos(dispositivosActualizados);
        setSincronizando(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error sincronizando dispositivos:', error);
      setSincronizando(false);
    }
  };

  // Función para conectar dispositivo
  const conectarDispositivo = async (dispositivoId) => {
    try {
      console.log('Conectando dispositivo:', dispositivoId);
      
      setDispositivos(prev => prev.map(disp => 
        disp.id === dispositivoId 
          ? { ...disp, estado: "Conectado" }
          : disp
      ));
      
      setMenuAbierto(null);
    } catch (error) {
      console.error('Error conectando dispositivo:', error);
    }
  };

  // Función para desconectar dispositivo
  const desconectarDispositivo = async (dispositivoId) => {
    try {
      console.log('Desconectando dispositivo:', dispositivoId);
      
      setDispositivos(prev => prev.map(disp => 
        disp.id === dispositivoId 
          ? { ...disp, estado: "Desconectado" }
          : disp
      ));
      
      setMenuAbierto(null);
    } catch (error) {
      console.error('Error desconectando dispositivo:', error);
    }
  };

  // Función para descargar registros
  const descargarRegistros = async (dispositivoId) => {
    try {
      console.log('Descargando registros del dispositivo:', dispositivoId);
      
      setDispositivos(prev => prev.map(disp => 
        disp.id === dispositivoId 
          ? { 
              ...disp, 
              ultimaDescarga: new Date().toLocaleString('es-ES', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }).toUpperCase()
            }
          : disp
      ));
      
      setMenuAbierto(null);
    } catch (error) {
      console.error('Error descargando registros:', error);
    }
  };

  // Toggle menú desplegable
  const toggleMenu = (dispositivoId, event) => {
    event.stopPropagation();
    setMenuAbierto(menuAbierto === dispositivoId ? null : dispositivoId);
  };

  // Función para formatear el estado de conexión
  const renderizarEstado = (estado) => {
    const estaConectado = estado === "Conectado";
    
    return (
      <div className="flex items-center gap-2">
        {estaConectado ? (
          <Wifi className="text-green-600" size={16} />
        ) : (
          <WifiOff className="text-red-600" size={16} />
        )}
        <span className={`font-semibold ${
          estaConectado ? "text-green-600" : "text-red-600"
        }`}>
          {estado.toUpperCase()}
        </span>
      </div>
    );
  };

  // Componente del menú desplegable
  const MenuDesplegable = ({ dispositivo, onClose }) => {
    const estaConectado = dispositivo.estado === "Conectado";

    return (
      <div 
        ref={el => menuRefs.current[dispositivo.id] = el}
        className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
        style={{
          top: 'auto',
          bottom: 'auto',
          left: 'auto',
          right: 'auto'
        }}
      >
        <div className="py-1">
          {/* Conectar/Desconectar */}
          {estaConectado ? (
            <button
              onClick={() => desconectarDispositivo(dispositivo.id)}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <PowerOff size={16} className="mr-3" />
              Desconectar
            </button>
          ) : (
            <button
              onClick={() => conectarDispositivo(dispositivo.id)}
              className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
            >
              <Power size={16} className="mr-3" />
              Conectar
            </button>
          )}

          {/* Descargar Registros */}
          <button
            onClick={() => descargarRegistros(dispositivo.id)}
            className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Download size={16} className="mr-3" />
            Descargar Registros
          </button>
        </div>
      </div>
    );
  };

  // Preparar datos para la tabla
  const datosParaTabla = dispositivos.map((dispositivo) => ({
    'Número de Dispositivo': dispositivo.id,
    'Nombre': (
      <div className="font-medium text-gray-900">
        {dispositivo.nombre}
      </div>
    ),
    'Última Descarga': (
      <div className="text-sm text-gray-600">
        {dispositivo.ultimaDescarga}
      </div>
    ),
    'Estado de Conexión': renderizarEstado(dispositivo.estado),
    'Acciones': (
      <div className="relative flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => toggleMenu(dispositivo.id, e)}
          className="h-8 w-8 p-0 hover:bg-gray-100 relative"
        >
          <MoreVertical size={16} />
        </Button>
        
        {menuAbierto === dispositivo.id && (
          <div className="absolute top-full right-0 mt-1 z-50">
            <MenuDesplegable 
              dispositivo={dispositivo}
              onClose={() => setMenuAbierto(null)}
            />
          </div>
        )}
      </div>
    )
  }));

  const columnasTabla = [
    'Número de Dispositivo', 
    'Nombre', 
    'Última Descarga', 
    'Acciones',
    'Estado de Conexión'

  ];

  // Función para manejar el click en una fila
  const manejarClickFila = (fila) => {
    console.log('Dispositivo clickeado:', fila);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fingerprint className="text-blue-700" size={28} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Dispositivos</h1>
            <p className="text-sm text-gray-600">
              {dispositivos.length} dispositivos registrados
            </p>
          </div>
        </div>

        <Button
          onClick={sincronizarDispositivos}
          disabled={sincronizando}
          className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2"
        >
          <RefreshCcw size={18} className={sincronizando ? "animate-spin" : ""} />
          {sincronizando ? "Sincronizando..." : "Actualizar (F5)"}
        </Button>
      </div>

      {/* Tabla de Dispositivos */}
      <Card className="shadow-md border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-700">
            Lista de Dispositivos
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          {cargando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando dispositivos...</p>
            </div>
          ) : dispositivos.length > 0 ? (
            <div className="relative">
              <Tabla 
                columnas={columnasTabla}
                datos={datosParaTabla}
                onRowClick={manejarClickFila}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Fingerprint size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No hay dispositivos registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atajos de teclado */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Atajos de Teclado</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">F5</kbd>
            <span className="text-gray-600">Actualizar</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl</kbd>
            <span className="text-gray-600">+</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">D</kbd>
            <span className="text-gray-600">Cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
}