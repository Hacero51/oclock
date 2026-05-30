'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Fingerprint, RefreshCcw, Wifi, WifiOff, MoreVertical, Download, Power, PowerOff } from "lucide-react";
import Tabla from "@/components/Table";
import UpdateModal from "@/components/UpdateModal";
import { useState, useEffect, useRef } from "react";

export default function DispositivosPage({ params, searchParams }) {
  const [dispositivos, setDispositivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
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

  // Cargar datos reales
  const cargarDispositivos = async () => {
    try {
      setCargando(true);
      const response = await fetch('/api/dispositivos');
      const data = await response.json();
      if (Array.isArray(data)) {
        setDispositivos(data);
      }
    } catch (error) {
      console.error('Error cargando dispositivos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDispositivos();
    // Polling cada 10 segundos para actualizar estado y última descarga
    const interval = setInterval(() => {
      cargarDispositivos();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Función para sincronizar dispositivos reales
  const sincronizarDispositivos = async () => {
    if (isSyncRT) {
      alert("⚠️ Detén el 'Monitor Tiempo Real' antes de sincronizar manualmente para evitar conflictos de conexión.");
      return;
    }

    try {
      setSincronizando(true);
      const response = await fetch('/api/dispositivos/sync', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        await cargarDispositivos();
        alert(`Sincronización completada:\n- Logs descargados: ${result.totalLogs}\n- Nuevos registros creados: ${result.newRecords}\n- Equipos actualizados: ${result.updatedMachines}`);
      } else {
        alert("Error: " + (result.error || "Fallo desconocido"));
      }
    } catch (error) {
      console.error('Error sincronizando dispositivos:', error);
      alert("Error de conexión al servidor");
    } finally {
      setSincronizando(false);
    }
  };

  const [isSyncRT, setIsSyncRT] = useState(false);

  const iniciarTiempoReal = async () => {
    // Si ya está activo, lo detenemos (Toggle)
    const action = isSyncRT ? 'stop' : 'start';

    if (!isSyncRT) setIsSyncRT(true); // UI optimista al iniciar

    try {
      const resp = await fetch('/api/dispositivos/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await resp.json();

      if (data.success || data.message) {
        if (action === 'stop') {
          setIsSyncRT(false); // Confirmamos apagado
          alert("Monitor detenido. Ahora puedes usar la Sincronización Manual.");
        } else {
          alert("¡Tiempo Real ACTIVO! Bloqueando sincronización manual por seguridad.");
        }
      }
    } catch (e) {
      alert("Error al cambiar estado del servicio RT");
      setIsSyncRT(false);
    }
  };

  // Función para conectar dispositivo (Simulado -> Ping/Sync)
  const conectarDispositivo = async (dispositivoId) => {
    try {
      const disp = dispositivos.find(d => d.id === dispositivoId);
      if (!disp) return;

      alert(`Conectando con ${disp.nombre}... Por favor espere.`);
      // Reusamos la lógica de descargar registros para "Conectar" ya que implica verificar conexión
      await descargarRegistros(dispositivoId);
    } catch (error) {
      console.error('Error conectando dispositivo:', error);
    }
  };

  // Función para desconectar dispositivo
  const desconectarDispositivo = async (dispositivoId) => {
    // No hay API de desconexión explícita en ZKTeco (stateless), solo se marca como desconectado si falla ping.
    // Simulamos la desconexión visualmente o advertimos.
    alert("Función de desconexión manual no disponible en este protocolo. El estado se actualizará automáticamente si el dispositivo pierde conexión.");
  };

  // Función para descargar registros
  const descargarRegistros = async (dispositivoId) => {
    try {
      const disp = dispositivos.find(d => d.id === dispositivoId);
      if (!disp) return;

      console.log('Descargando registros de:', disp.nombre);

      // Llamada a la API de Sincronización Específica
      const response = await fetch('/api/dispositivos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devices: [disp.nombre] })
      });
      const result = await response.json();

      if (result.success) {
        alert(`✅ Conexión Exitosa con ${disp.nombre}\n- Logs: ${result.totalLogs}\n- Nuevos: ${result.newRecords}`);
        await cargarDispositivos(); // Actualizar tabla inmediatamente
      } else {
        alert(`❌ Error conectando con ${disp.nombre}: ` + (result.error || "Fallo desconocido"));
      }

    } catch (error) {
      console.error('Error descargando registros:', error);
      alert("Error de red al intentar descargar registros.");
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
        <span className={`font-semibold ${estaConectado ? "text-green-600" : "text-red-600"
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
        className="absolute right-full mr-2 top-0 mt-0 bg-white rounded-xl shadow-lg border border-gray-200 z-[9999] min-w-[220px] overflow-hidden"
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
        {/* Menú fuera del botón para evitar anidamiento */}
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
    // La fila contiene datos formateados para la tabla.
    // Usamos el ID ('Número de Dispositivo') para encontrar el objeto original.
    if (fila) {
      const idDispositivo = fila['Número de Dispositivo'];
      const dispositivoOriginal = dispositivos.find(d => d.id === idDispositivo);
      if (dispositivoOriginal) {
        setSelectedDevice(dispositivoOriginal);
      }
    }
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

        <div className="flex gap-2 w-full sm:w-auto">


          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">Modo Servidor ADMS Activo</span>
          </div>

          <Button
            onClick={iniciarTiempoReal}
            disabled={false} // Siempre habilitado para poder apagarlo
            variant={isSyncRT ? "destructive" : "outline"}
            className={`${isSyncRT ? "bg-red-50 text-red-600 border-red-200" : "border-green-600 text-green-600 hover:bg-green-50"} flex items-center gap-2 shadow-sm`}
          >
            <div className={`w-2 h-2 rounded-full ${isSyncRT ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
            {isSyncRT ? "Detener Monitor" : "Monitor Tiempo Real"}
          </Button>

          <Button
            onClick={sincronizarDispositivos}
            disabled={cargando || sincronizando}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
            title="Sincronizar y actualizar registros de dispositivos"
          >
            <RefreshCcw size={18} className={cargando || sincronizando ? "animate-spin" : ""} />
            {sincronizando ? "Sincronizando..." : "Verificar Conexión"}
          </Button>
        </div>
      </div>

      {/* Tabla de Dispositivos */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
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

      {/* Modal de Actualización */}
      {selectedDevice && (
        <UpdateModal
          type="dispositivo"
          data={selectedDevice}
          onClose={() => {
            setSelectedDevice(null);
            cargarDispositivos(); // Recargar al cerrar por si hubo cambios
          }}
        />
      )}
    </div>
  );
}