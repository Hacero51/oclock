"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { useState, useEffect } from "react";
import {
  Smartphone,
  Users,
  Building,
  Download,
  Settings,
  Database,
  Filter
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Datos de ejemplo - sin campo fechaRegistro
const empleadosEjemplo = [
  {
    id: 1,
    nombre: "SANDRA MILENA BERNAL P...",
    tiempo: "SÁBADO, 1 enero del 2025 08:00 AM",
    tipo: "Entrada",
    metodo: "Huella"
  },
  {
    id: 2,
    nombre: "MAURICIO VERA RINCON",
    tiempo: "MIERCOLES, 5 febrero del 2025 17:00 PM",
    tipo: "Salida",
    metodo: "Huella"
  },
  {
    id: 3,
    nombre: "ALBA ROCIO SOTO SUAREZ",
    tiempo: "DOMINGO, 9 marzo del 2025  09:00 AM",
    tipo: "Entrada",
    metodo: "Huella"
  },
  {
    id: 4,
    nombre: "ANILSON RODRIGUEZ CAR...",
    tiempo: "MARTES, 15 abril del 2025 18:00 PM",
    tipo: "Salida",
    metodo: "Huella"
  },
  {
    id: 5,
    nombre: "JUAN PÉREZ",
    tiempo: "MIERCOLES, 5 noviembre del 2025 08:00 AM    ",
    tipo: "Entrada",
    metodo: "Huella Digital"
  },
  {
    id: 6,
    nombre: "MARÍA GARCÍA",
    tiempo: "SÁBADO, 1 novimebre del 2025 05:00 PM",
    tipo: "Salida",
    metodo: "Tarjeta RFID"
  }
];

export default function DispositivoForm({ data, onClose }) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [dispositivoCreado, setDispositivoCreado] = useState(null);
  const [tipoConexion, setTipoConexion] = useState("red");

  // Estados para el filtro de tiempo
  const [filtroTiempo, setFiltroTiempo] = useState("todos");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState(empleadosEjemplo);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      nombre: "",
      fechaDispositivo: "",
      ubicacion: "",
      departamento: "",
      ip: "192.168.1.100",
      puerto: "4370",
      softwareVersion: "v2.1.5",
      tipoConexion: "red",
      baudRate: "115200",
      contraseña: "******",
      puertoSerial: "COM3",
      capacidadUsuarios: "1000",
      capacidadRegistros: "50000",
      capacidadHuellas: "3000",
      capacidadRostros: "1000",
      longitudNumeroLector: "10"
    }
  });

  // Estados para el filtro de tiempo
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Mapeo de opciones de filtro a rangos de fecha
  const obtenerRangoFechas = (filtro) => {
    const hoy = new Date();
    const hasta = new Date(hoy); // Clonar para no modificar hoy
    let desde = new Date(hoy);

    switch (filtro) {
      case "hoy":
        // desde = hoy (inicio del dia se maneja en backend o aqui)
        desde.setHours(0, 0, 0, 0);
        break;
      case "mes-actual":
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case "ultimos-30":
        desde.setDate(hoy.getDate() - 30);
        break;
      case "ultimos-60":
        desde.setDate(hoy.getDate() - 60);
        break;
      case "ano-actual":
        desde = new Date(hoy.getFullYear(), 0, 1);
        break;
      case "ultimos-365":
        desde.setDate(hoy.getDate() - 365);
        break;
      case "todos":
      default:
        return { desde: null, hasta: null };
    }
    return { desde: desde.toISOString().split('T')[0], hasta: hasta.toISOString().split('T')[0] };
  };

  useEffect(() => {
    const fetchLogs = async () => {
      if (!data?.oid || activeTab !== "capacidad") return;

      setLogsLoading(true);
      try {
        const { desde, hasta } = obtenerRangoFechas(filtroTiempo);
        let query = `/api/registros?dispositivo=${data.oid}&page=${page}&limit=${limit}`;

        if (desde && hasta) {
          query += `&desde=${desde}&hasta=${hasta}`;
        }

        const res = await fetch(query);
        if (res.ok) {
          const result = await res.json();
          setLogs(result.data || []);
          setTotalRecords(result.pagination.total);
          setTotalPages(result.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, [data?.oid, filtroTiempo, activeTab, page, limit]);

  // Fetch fresh data when component mounts or data.oid changes
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDeviceData = async () => {
      if (!data?.oid) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/dispositivos/${data.oid}`);
        if (!response.ok) throw new Error('Error cargando datos');

        const deviceData = await response.json();

        // Populate form with API data
        reset({
          nombre: deviceData.nombre || "",
          fechaDispositivo: deviceData.fechaDispositivo || "",
          ip: deviceData.ip || "",
          puerto: deviceData.puerto || "",
          softwareVersion: deviceData.softwareVersion || "",
          tipoConexion: deviceData.tipoConexion?.toLowerCase() || "red",
          baudRate: deviceData.baudRate || "",
          contraseña: deviceData.contraseña || "",
          puertoSerial: deviceData.puertoSerial || "",
          capacidadUsuarios: deviceData.capacidadUsuarios || 0,
          capacidadRegistros: deviceData.capacidadRegistros || 0,
          capacidadHuellas: deviceData.capacidadHuellas || 0,
          capacidadRostros: deviceData.capacidadRostros || 0,
          longitudNumeroLector: deviceData.longitudNumeroLector || 9,
          cantidadadministrador: deviceData.cantidadadministrador || 0,
          cantidadcontrasena: deviceData.cantidadcontrasena || 0,
          firware: deviceData.firware || "",
          serie: deviceData.serie || "",
          versionfingerprint: deviceData.versionfingerprint || "",

          // Maximos
          cantidadMaximaUsuarios: deviceData.cantidadMaximaUsuarios,
          cantidadMaximaRegistros: deviceData.cantidadMaximaRegistros,
          cantidadMaximaHuellas: deviceData.cantidadMaximaHuellas,
          cantidadMaximaRostros: deviceData.cantidadMaximaRostros,
        });

        setTipoConexion(deviceData.tipoConexion?.toLowerCase() || "red");

      } catch (error) {
        console.error("Error fetching device details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDeviceData();
  }, [data, reset]);

  const onSubmit = async (formData) => {
    try {
      console.log("Actualizando dispositivo:", formData);
      setLoading(true);

      if (!data?.oid) {
        console.error("No hay OID para actualizar");
        return;
      }

      const response = await fetch(`/api/dispositivos/${data.oid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Notificar exito (podriamos usar un toast aqui)
        onClose();
      } else {
        console.error("Failed to update device");
      }

    } catch (error) {
      console.error("Error actualizando dispositivo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio del select
  const handleTipoConexionChange = (value) => {
    setTipoConexion(value);
    setValue("tipoConexion", value);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="informacion" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="capacidad" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Capacidad
          </TabsTrigger>
          <TabsTrigger value="parametros" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Parametros de Comunicacion
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA 1: INFORMACIÓN */}
        <TabsContent value="informacion">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Dispositivo Clock</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Número de Dispositivos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Número de Dispositivos: </Label>
                  <Input
                    className="bg-white text-black"
                    id="nuneroDispositivos"
                    {...register("nomeroDispositivos")}
                    placeholder="Numero del dispositivo"
                  />
                </div>

                {/* Primera fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium">
                      Nombre
                    </Label>
                    <Input
                      className="bg-white text-black"
                      id="nombre"
                      {...register("nombre")}
                      placeholder="Ingrese nombre del dispositivo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaDispositivo" className="text-sm font-medium">
                      Fecha del Dispositivo
                    </Label>
                    <Input
                      className="bg-white text-black"
                      id="fechaDispositivo"
                      type="date"
                      {...register("fechaDispositivo")}
                    />
                  </div>
                </div>

                {/* Segunda fila - Estados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Estado de Conexión
                    </Label>
                    <div className="p-2 border rounded-md bg-gray-50">
                      <span className="text-gray-700">Desconectado</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Estado
                    </Label>
                    <div className="p-2 border rounded-md bg-gray-50">
                      <span className="text-gray-700">Activo</span>
                    </div>
                  </div>
                </div>

                {/* Información - Cantidades */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Información</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacidadUsuarios" className="text-sm">
                        Cantidad de Usuarios
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="capacidadUsuarios"
                        type="number"
                        {...register("capacidadUsuarios")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacidadRegistros" className="text-sm">
                        Cantidad de Registros
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="capacidadRegistros"
                        type="number"
                        {...register("capacidadRegistros")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacidadHuellas" className="text-sm">
                        Cantidad de Huellas
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="capacidadHuellas"
                        type="number"
                        {...register("capacidadHuellas")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacidadRostros" className="text-sm">
                        Cantidad de Rostros
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="capacidadRostros"
                        type="number"
                        {...register("capacidadRostros")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitudNumeroLector" className="text-sm">
                        Longitud Número de Lector
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="longitudNumeroLector"
                        type="number"
                        {...register("longitudNumeroLector")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cantidadadministrador" className="text-sm">
                        Cantidad de Accesos del Administrador
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="cantidadadministrador"
                        type="number"
                        {...register("cantidadadministrador")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cantidadcontrasena" className="text-sm">
                        Cantidad de Contraseñas
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="cantidadcontrasena"
                        type="number"
                        {...register("cantidadcontrasena")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firware" className="text-sm">
                        Firware
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="firware"
                        {...register("firware")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serie" className="text-sm">
                        Numero de Serie
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="serie"
                        {...register("serie")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="versionfingerprint" className="text-sm">
                        Version Fingerprint
                      </Label>
                      <Input
                        className="bg-white text-black"
                        id="versionfingerprint"
                        {...register("versionfingerprint")}
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Guardar Dispositivo
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* PESTAÑA 2: CAPACIDAD - Con filtro corregido */}
        <TabsContent value="capacidad">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Capacidad</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Capacidades Máximas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Cantidad máxima de usuarios</Label>
                      <Input
                        className="bg-white text-black"
                        id="cantidadMaximaUsuarios"
                        type="number"
                        {...register("cantidadMaximaUsuarios")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Cantidad máxima de registros</Label>
                      <Input
                        className="bg-white text-black"
                        id="cantidadMaximaRegistros"
                        type="number"
                        {...register("cantidadMaximaRegistros")}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Cantidad máxima de huellas</Label>
                      <Input
                        className="bg-white text-black"
                        id="cantidadMaximaHuellas"
                        type="number"
                        {...register("cantidadMaximaHuellas")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Cantidad máxima de rostros</Label>
                      <Input
                        className="bg-white text-black"
                        id="cantidadMaximaRostros"
                        type="number"
                        {...register("cantidadMaximaRostros")}
                      />
                    </div>
                  </div>
                </div>

                {/* Registro de entrada y salida */}
                <div className="space-y-4">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Registro de entrada y salida</CardTitle>
                  </CardHeader>

                  {/* Filtro de Tiempo Simple */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrar por Tiempo
                      </Label>
                      <div className="text-xs text-gray-600">
                        Mostrando {logs.length} registros
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Select value={filtroTiempo} onValueChange={setFiltroTiempo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tiempo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="hoy">Hoy</SelectItem>
                            <SelectItem value="mes-actual">Mes Actual</SelectItem>
                            <SelectItem value="ultimos-30">Últimos 30 días</SelectItem>
                            <SelectItem value="ultimos-60">Últimos 60 días</SelectItem>
                            <SelectItem value="ano-actual">Año Actual</SelectItem>
                            <SelectItem value="ultimos-365">Últimos 365 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Items por pag:</Label>
                      <Select value={String(limit)} onValueChange={(v) => {
                        setLimit(Number(v));
                        setPage(1); // Reset a pagina 1
                      }}>
                        <SelectTrigger className="w-[70px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tabla de Empleados */}
                <Label className="text-sm font-medium">Empleados</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100 text-sm font-medium">
                    <div className="col-span-4">Empleado</div>
                    <div className="col-span-3">Tiempo</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-3">Método verificación</div>
                  </div>

                  {logsLoading ? (
                    <div className="p-4 text-center text-gray-500">Cargando registros...</div>
                  ) : logs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No se encontraron registros para este periodo.</div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm hover:bg-gray-50">
                        <div className="col-span-4 truncate">{log.empleado}</div>
                        <div className="col-span-3 text-xs">
                          {new Date(log.tiempo).toLocaleDateString('es-CO', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                            timeZone: 'UTC'
                          }).toUpperCase()}
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-1 rounded text-xs ${log.tipo.includes('Entrada') ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                            }`}>
                            {log.tipo}
                          </span>
                        </div>
                        <div className="col-span-3 text-xs">{log.metodoverificacion || 'Desconocido'}</div>
                      </div>
                    )))}
                </div>

                {/* Paginación */}
                {totalRecords > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Pagina {page} de {totalPages} ({totalRecords} items)
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || logsLoading}
                      >
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || logsLoading}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </TabsContent >


        {/* PESTAÑA 3: PARAMETROS */}
        < TabsContent value="parametros" >
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Configuración de Red */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Configuración de Red</Label>
                    <div className="space-y-2">
                      <Label htmlFor="ip" className="text-sm">IP</Label>
                      <Input className="bg-white text-black" id="ip" {...register("ip")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puerto" className="text-sm">Puerto</Label>
                      <Input className="bg-white text-black" id="puerto" {...register("puerto")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="softwareVersion" className="text-sm">Software Version</Label>
                      <Input className="bg-white text-black" id="softwareVersion" {...register("softwareVersion")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoConexion" className="text-sm">Tipo de Conexión</Label>
                      <Select
                        value={tipoConexion}
                        onValueChange={handleTipoConexionChange}
                      >
                        <SelectTrigger id="tipoConexion">
                          <SelectValue placeholder="Selecciona el tipo de conexión" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="serial">Puerto Serial</SelectItem>
                          <SelectItem value="usb">USB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Acceso</Label>
                    <div className="space-y-2">
                      <Label htmlFor="baudRate" className="text-sm">Baud Rate</Label>
                      <Input className="bg-white text-black" id="baudRate" {...register("baudRate")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contraseña" className="text-sm">Contraseña</Label>
                      <Input className="bg-white text-black" id="contraseña" type="password" {...register("contraseña")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puertoSerial" className="text-sm">Puerto Serial</Label>
                      <Input className="bg-white text-black" id="puertoSerial" {...register("puertoSerial")} />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent >
      </Tabs >
    </div >
  );
}