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
        className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 min-w-[180px] overflow-hidden"
      >
        <div className="py-1">
          {/* Conectar/Desconectar */}
          {estaConectado ? (
            <button
              onClick={() => desconectarDispositivo(dispositivo.id)}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <PowerOff size={16} className="mr-3" />
              Desconectar
            </button>
          ) : (
            <button
              onClick={() => conectarDispositivo(dispositivo.id)}
              className="flex items-center w-full px-4 py-3 text-sm text-green-600 hover:bg-green-50 transition-all duration-200"
            >
              <Power size={16} className="mr-3" />
              Conectar
            </button>
          )}

          {/* Descargar Registros */}
          <button
            onClick={() => descargarRegistros(dispositivo.id)}
            className="flex items-center w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-all duration-200"
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
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <MoreVertical size={16} />
        </Button>
        
        {menuAbierto === dispositivo.id && (
          <MenuDesplegable 
            dispositivo={dispositivo}
            onClose={() => setMenuAbierto(null)}
          />
        )}
      </div>
    )
  }));

  const columnasTabla = [
    'Número de Dispositivo', 
    'Nombre', 
    'Última Descarga', 
    'Estado de Conexión',
    'Acciones'
  ];

  // Función para manejar el click en una fila
  const manejarClickFila = (fila) => {
    console.log('Dispositivo clickeado:', fila);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Fingerprint className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispositivos</h1>
            <p className="text-sm text-gray-600 mt-1">
              {dispositivos.length} dispositivos registrados
            </p>
          </div>
        </div>

        <Button
          onClick={sincronizarDispositivos}
          disabled={sincronizando}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
        >
          <RefreshCcw size={18} className={sincronizando ? "animate-spin" : ""} />
          {sincronizando ? "Sincronizando..." : "Actualizar"}
        </Button>
      </div>

      {/* Tabla de Dispositivos */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <CardTitle className="text-lg text-gray-900">
            Lista de Dispositivos
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 bg-white">
          {cargando ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="h-8 w-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-500">Cargando dispositivos...</p>
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
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay dispositivos registrados</h3>
              <p className="text-gray-500 mb-4">No se encontraron dispositivos en el sistema</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}