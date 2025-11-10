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

export default function DispositivoForm({ onClose }) {
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

  // Función para simular filtrado por tiempo (sin usar datos de la tabla)
  const aplicarFiltroTiempo = () => {
    // En un caso real, aquí harías una llamada a la API con el filtro seleccionado
    // Por ahora, simulamos que algunos filtros devuelven menos resultados
    
    switch (filtroTiempo) {
      case "hoy":
        // Simular que solo hay 3 registros para "Hoy"
        setEmpleadosFiltrados(empleadosEjemplo.slice(0, 3));
        break;
      
      case "mes-actual":
        // Simular que hay 4 registros para "Mes Actual"
        setEmpleadosFiltrados(empleadosEjemplo.slice(0, 4));
        break;
      
      case "ultimos-7":
        // Simular que hay 2 registros para "Últimos 7 días"
        setEmpleadosFiltrados(empleadosEjemplo.slice(0, 2));
        break;
      
      case "ultimos-30":
        // Simular que hay 5 registros para "Últimos 30 días"
        setEmpleadosFiltrados(empleadosEjemplo.slice(0, 5));
        break;
      
      case "año-actual":
        // Simular que hay todos los registros para "Año Actual"
        setEmpleadosFiltrados(empleadosEjemplo);
        break;
      
      case "todos":
      default:
        // Mostrar todos los registros
        setEmpleadosFiltrados(empleadosEjemplo);
        break;
    }
  };

  // Aplicar filtro automáticamente cuando cambie
  useEffect(() => {
    aplicarFiltroTiempo();
  }, [filtroTiempo]);

  const onSubmit = async (data) => {
    try {
      console.log("Creando dispositivo:", data);
      
      const nuevoDispositivo = {
        id: Date.now(),
        ...data,
        fechaCreacion: new Date().toISOString(),
        estadoConexion: "Desconectado",
        estado: "Activo"
      };

      setDispositivoCreado(nuevoDispositivo);
      
    } catch (error) {
      console.error("Error creando dispositivo:", error);
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
                            id="firware"
                            {...register("firware")}
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="serie" className="text-sm">
                            Numero de Serie
                        </Label>
                        <Input
                            id="serie"
                            {...register("serie")}
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="versionfingerprint" className="text-sm">
                            Version Fingerprint
                        </Label>
                        <Input
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
                        id="cantidadMaximaUsuarios"
                        type="number"
                        {...register("cantidadMaximaUsuarios")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Cantidad máxima de registros</Label>
                      <Input
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
                        id="cantidadMaximaHuellas"
                        type="number"
                        {...register("cantidadMaximaHuellas")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Cantidad máxima de rostros</Label>
                      <Input
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
                        Mostrando {empleadosFiltrados.length} de {empleadosEjemplo.length} registros
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Select value={filtroTiempo} onValueChange={setFiltroTiempo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tiempo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos los tiempos</SelectItem>
                            <SelectItem value="hoy">Hoy</SelectItem>
                            <SelectItem value="mes-actual">Mes Actual</SelectItem>
                            <SelectItem value="ultimos-7">Últimos 7 días</SelectItem>
                            <SelectItem value="ultimos-30">Últimos 30 días</SelectItem>
                            <SelectItem value="año-actual">Año Actual</SelectItem>
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
                    
                    {empleadosFiltrados.map((empleado) => (
                      <div key={empleado.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm hover:bg-gray-50">
                        <div className="col-span-4">{empleado.nombre}</div>
                        <div className="col-span-3">{empleado.tiempo}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            empleado.tipo === 'Entrada' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {empleado.tipo}
                          </span>
                        </div>
                        <div className="col-span-3">{empleado.metodo}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* PESTAÑA 3: PARAMETROS */}
        <TabsContent value="parametros">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Configuración de Red */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Configuración de Red</Label>
                    <div className="space-y-2">
                      <Label htmlFor="ip" className="text-sm">IP</Label>
                      <Input id="ip" {...register("ip")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puerto" className="text-sm">Puerto</Label>
                      <Input id="puerto" {...register("puerto")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="softwareVersion" className="text-sm">Software Version</Label>
                      <Input id="softwareVersion" {...register("softwareVersion")} />
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
                      <Input id="baudRate" {...register("baudRate")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contraseña" className="text-sm">Contraseña</Label>
                      <Input id="contraseña" type="password" {...register("contraseña")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puertoSerial" className="text-sm">Puerto Serial</Label>
                      <Input id="puertoSerial" {...register("puertoSerial")} />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}