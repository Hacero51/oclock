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
  Filter,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Datos de ejemplo mejorados con fechas reales
const empleadosEjemplo = [
  {
    id: 1,
    nombre: "SANDRA MILENA BERNAL P...",
    tiempo: "SÁBADO, 1",
    tipo: "Hoy",
    metodo: "Huella",
    fecha: new Date(),
    fechaRegistro: new Date()
  },
  {
    id: 2,
    nombre: "MAURICIO VERA RINCON",
    tiempo: "SÁBADO, 1", 
    tipo: "Últimos 30 días",
    metodo: "Huella",
    fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
    fechaRegistro: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    nombre: "ALBA ROCIO SOTO SUAREZ",
    tiempo: "SÁBADO, 1",
    tipo: "Año Actual",
    metodo: "Huella",
    fecha: new Date(new Date().getFullYear(), 5, 15), // 15 de junio del año actual
    fechaRegistro: new Date(new Date().getFullYear(), 5, 15)
  },
  {
    id: 4,
    nombre: "ANILSON RODRIGUEZ CAR...",
    tiempo: "SÁBADO, 1",
    tipo: "Últimos 365 días",
    metodo: "Huella",
    fecha: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 días atrás
    fechaRegistro: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000)
  },
  {
    id: 5,
    nombre: "JUAN PÉREZ",
    tiempo: "SÁBADO, 1 - 08:00 AM",
    tipo: "Entrada",
    metodo: "Huella Digital",
    fecha: new Date(),
    fechaRegistro: new Date()
  },
  {
    id: 6,
    nombre: "MARÍA GARCÍA",
    tiempo: "SÁBADO, 1 - 05:00 PM", 
    tipo: "Salida",
    metodo: "Tarjeta RFID",
    fecha: new Date(),
    fechaRegistro: new Date()
  }
];

export default function DispositivoForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [dispositivoCreado, setDispositivoCreado] = useState(null);
  const [tipoConexion, setTipoConexion] = useState("red");
  
  // Estados para los filtros
  const [filtroRango, setFiltroRango] = useState("hoy");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState(empleadosEjemplo);
  const [mostrandoResultados, setMostrandoResultados] = useState(empleadosEjemplo.length);

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

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let filtrados = [...empleadosEjemplo];
    
    // Aplicar filtro por rango predefinido
    if (filtroRango === "hoy") {
      const hoy = new Date();
      filtrados = filtrados.filter(emp => 
        emp.fecha.toDateString() === hoy.toDateString()
      );
    } else if (filtroRango === "ultimos-7") {
      const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtrados = filtrados.filter(emp => emp.fecha >= hace7Dias);
    } else if (filtroRango === "ultimos-30") {
      const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filtrados = filtrados.filter(emp => emp.fecha >= hace30Dias);
    } else if (filtroRango === "ultimos-60") {
      const hace60Dias = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      filtrados = filtrados.filter(emp => emp.fecha >= hace60Dias);
    } else if (filtroRango === "mes-actual") {
      const ahora = new Date();
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      filtrados = filtrados.filter(emp => 
        emp.fecha >= primerDiaMes && emp.fecha <= ultimoDiaMes
      );
    } else if (filtroRango === "año-actual") {
      const ahora = new Date();
      const primerDiaAño = new Date(ahora.getFullYear(), 0, 1);
      const ultimoDiaAño = new Date(ahora.getFullYear(), 11, 31);
      filtrados = filtrados.filter(emp => 
        emp.fecha >= primerDiaAño && emp.fecha <= ultimoDiaAño
      );
    } else if (filtroRango === "ultimos-365") {
      const hace365Dias = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      filtrados = filtrados.filter(emp => emp.fecha >= hace365Dias);
    }
    
    // Aplicar filtro por fechas personalizadas
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      filtrados = filtrados.filter(emp => emp.fecha >= desde);
    }
    
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999); // Incluir todo el día
      filtrados = filtrados.filter(emp => emp.fecha <= hasta);
    }
    
    setEmpleadosFiltrados(filtrados);
    setMostrandoResultados(filtrados.length);
  };

  // Función para filtro rápido
  const filtroRapido = (rango) => {
    setFiltroRango(rango);
    setFechaDesde("");
    setFechaHasta("");
    
    // Aplicar el filtro automáticamente
    setTimeout(() => {
      aplicarFiltros();
    }, 0);
  };

  // Aplicar filtros automáticamente cuando cambien las fechas
  useEffect(() => {
    if (fechaDesde || fechaHasta) {
      aplicarFiltros();
    }
  }, [fechaDesde, fechaHasta]);

  // Aplicar filtro inicial
  useEffect(() => {
    aplicarFiltros();
  }, []);

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

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroRango("hoy");
    setFechaDesde("");
    setFechaHasta("");
    setEmpleadosFiltrados(empleadosEjemplo);
    setMostrandoResultados(empleadosEjemplo.length);
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

        {/* PESTAÑA 2: CAPACIDAD */}
        <TabsContent value="capacidad">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Capacidad</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                    {/* Check In Out y Menu Store */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Cantidad Maxima de Usuarios</Label>
                                    <Input
                                        id="cantidadMaximaUsuarios"
                                        type="number"
                                        {...register("cantidadMaximaUsuarios")}
                                    />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Cantidad Maxima de Registros</Label>
                                    <Input
                                        id="cantidadMaximaRegistros"
                                        type="number"
                                        {...register("cantidadMaximaRegistros")}
                                    />
                                </div>
                            </div>
                        </div>
                            <div className="space-y-4">   
                                <div className="space-y-2">
                                <Label className="text-sm">Cantidad Maxima de Huellas</Label>
                                        <Input
                                            id="cantidadMaximaHuellas"
                                            type="number"
                                            {...register("cantidadMaximaHuellas")}
                                        />
                                </div>
                                <div className="space-y-2">
                                <Label className="text-sm">Cantidad Maxima de Rostros</Label>
                                        <Input
                                            id="cantidadMaximaRostros"
                                            type="number"
                                            {...register("cantidadMaximaRostros")}
                                        />
                                </div>
                            </div>
                    </div>

                {/* Lista de Empleados con Filtros Avanzados */}
                <div className="space-y-4">                             
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Check In Out
                    </CardTitle>
                  </CardHeader>
                  
                  {/* Filtros de Tiempo Avanzados */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrar por Rango de Tiempo
                      </Label>
                      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Mostrando {mostrandoResultados} de {empleadosEjemplo.length} registros
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Rango Predefinido</Label>
                        <Select value={filtroRango} onValueChange={setFiltroRango}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rango" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hoy">Hoy</SelectItem>
                            <SelectItem value="ultimos-7">Últimos 7 días</SelectItem>
                            <SelectItem value="ultimos-30">Últimos 30 días</SelectItem>
                            <SelectItem value="ultimos-60">Últimos 60 días</SelectItem>
                            <SelectItem value="mes-actual">Mes Actual</SelectItem>
                            <SelectItem value="año-actual">Año Actual</SelectItem>
                            <SelectItem value="ultimos-365">Últimos 365 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Fecha Desde
                        </Label>
                        <Input 
                          type="date" 
                          value={fechaDesde}
                          onChange={(e) => setFechaDesde(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Fecha Hasta
                        </Label>
                        <Input 
                          type="date" 
                          value={fechaHasta}
                          onChange={(e) => setFechaHasta(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs invisible">Aplicar</Label>
                        <Button 
                          onClick={aplicarFiltros}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Aplicar
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs invisible">Limpiar</Label>
                        <Button 
                          onClick={limpiarFiltros}
                          variant="outline"
                          className="w-full"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Filtros rápidos */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button 
                        variant={filtroRango === "hoy" ? "default" : "outline"}
                        size="sm" 
                        className="text-xs"
                        onClick={() => filtroRapido("hoy")}
                      >
                        Hoy
                      </Button>
                      <Button 
                        variant={filtroRango === "ultimos-7" ? "default" : "outline"}
                        size="sm" 
                        className="text-xs"
                        onClick={() => filtroRapido("ultimos-7")}
                      >
                        Últimos 7 días
                      </Button>
                      <Button 
                        variant={filtroRango === "ultimos-30" ? "default" : "outline"}
                        size="sm" 
                        className="text-xs"
                        onClick={() => filtroRapido("ultimos-30")}
                      >
                        Últimos 30 días
                      </Button>
                      <Button 
                        variant={filtroRango === "mes-actual" ? "default" : "outline"}
                        size="sm" 
                        className="text-xs"
                        onClick={() => filtroRapido("mes-actual")}
                      >
                        Mes Actual
                      </Button>
                      <Button 
                        variant={filtroRango === "año-actual" ? "default" : "outline"}
                        size="sm" 
                        className="text-xs"
                        onClick={() => filtroRapido("año-actual")}
                      >
                        Año Actual
                      </Button>
                    </div>
                  </div>

                  <Label className="text-sm font-medium">Empleados</Label>
                  <div className="border rounded-lg overflow-hidden">
                    {/* Encabezados */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100 text-sm font-medium">
                      <div className="col-span-4">Empleado</div>
                      <div className="col-span-3">Tiempo</div>
                      <div className="col-span-2">Tipo</div>
                      <div className="col-span-3">Método verificación</div>
                    </div>
                    
                    {/* Filas de datos filtradas */}
                    {empleadosFiltrados.length > 0 ? (
                      empleadosFiltrados.map((empleado) => (
                        <div key={empleado.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm hover:bg-gray-50 transition-colors">
                          <div className="col-span-4 font-medium">{empleado.nombre}</div>
                          <div className="col-span-3 text-gray-600">{empleado.tiempo}</div>
                          <div className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              empleado.tipo === 'Hoy' ? 'bg-green-100 text-green-800' :
                              empleado.tipo === 'Entrada' ? 'bg-blue-100 text-blue-800' :
                              empleado.tipo === 'Salida' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {empleado.tipo}
                            </span>
                          </div>
                          <div className="col-span-3 text-gray-600">{empleado.metodo}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No se encontraron registros con los filtros aplicados
                      </div>
                    )}
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