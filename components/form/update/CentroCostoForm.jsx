"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useState } from "react";
import { 
  Building, 
  Code,
  Users,
  User,
  Mail,
  Calendar,
  Briefcase,
  Clock,
  DollarSign
} from "lucide-react";

// Datos de ejemplo para centros de costo padre
const centrosCostoPadre = [
  { id: 1, codigo: "ADMIN", nombre: "ADMINISTRACIÓN" },
  { id: 2, codigo: "ADMIN-RH", nombre: "ADMINISTRACIÓN RECURSOS HUMANOS" },
  { id: 3, codigo: "ADMIN-FIN", nombre: "ADMINISTRACIÓN FINANCIERA" },
  { id: 4, codigo: "ADMIN-CD", nombre: "ADMINISTRACIÓN CORA & DIRECTA" },
  { id: 5, codigo: "CALIDAD", nombre: "CALIDAD" },
  { id: 6, codigo: "ING-PROD", nombre: "INGENIERÍA PRODUCCIÓN" },
  { id: 7, codigo: "MCD-MK", nombre: "MAYO DE CORA DIRECTA / MÚSICA" },
  { id: 8, codigo: "MCD-MGR", nombre: "MAYO DE CORA DIRECTA MANAGERA" },
  { id: 9, codigo: "MCD-MGRS", nombre: "MAYO DE CORA DIRECTA MANAGERAS" },
  { id: 10, codigo: "PROD", nombre: "PRODUCCIÓN" },
  { id: 11, codigo: "VENTAS", nombre: "VENTAS" },
  { id: 12, codigo: "TL-MCD", nombre: "TULLIS NAVO DE CORA DIRECTA" },
  { id: 13, codigo: "LOGIS", nombre: "LOGÍSTICA" }
];

// Datos de ejemplo para empleados
const empleadosEjemplo = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    documento: "11223344",
    email: "carlos.rodriguez@empresa.com",
    cargo: "Analista de Costos",
    departamento: "Finanzas",
    centroCosto: "ADMIN-FIN",
    turnoActual: "OFICINA 8AM-5PM",
    salarioHora: 25.50,
    estado: "activo"
  },
  {
    id: 2,
    nombre: "Ana Martínez",
    documento: "55667788",
    email: "ana.martinez@empresa.com",
    cargo: "Supervisora de Producción",
    departamento: "Producción",
    centroCosto: "PROD",
    turnoActual: "TURNO MAÑANA",
    salarioHora: 30.75,
    estado: "activo"
  },
  {
    id: 3,
    nombre: "Luis García",
    documento: "99887766",
    email: "luis.garcia@empresa.com",
    cargo: "Coordinador de Calidad",
    departamento: "Calidad",
    centroCosto: "CALIDAD",
    turnoActual: "ADMINISTRATIVO",
    salarioHora: 28.90,
    estado: "inactivo"
  }
];

export default function CentroCostoForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("crear");
  const [centroCostoCreado, setCentroCostoCreado] = useState(null);
  const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const centroCostoPadreSeleccionado = watch("centroCostoPadre");

  const onSubmit = async (data) => {
    try {
      // Simular creación del centro de costo en la API
      console.log("Creando centro de costo:", data);
      
      // Encontrar el centro de costo padre seleccionado
      const centroPadre = centrosCostoPadre.find(cc => cc.id === parseInt(data.centroCostoPadre));
      
      const nuevoCentroCosto = {
        id: Date.now(),
        ...data,
        centroCostoPadre: centroPadre,
        fechaCreacion: new Date().toISOString()
      };

      setCentroCostoCreado(nuevoCentroCosto);
      
      // Simular obtención de empleados con este centro de costo
      const empleadosConEsteCentro = empleadosEjemplo.filter(
        emp => emp.centroCosto === data.codigo
      );
      
      setEmpleadosAsignados(empleadosConEsteCentro);
      setActiveTab("empleados");
      
    } catch (error) {
      console.error("Error creando centro de costo:", error);
    }
  };

  const crearNuevoCentroCosto = () => {
    setCentroCostoCreado(null);
    setEmpleadosAsignados([]);
    setActiveTab("crear");
    reset();
  };

  const empleadosFiltrados = empleadosAsignados.filter(emp => 
    filtroEstado === "todos" || emp.estado === filtroEstado
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="crear" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Crear Centro de Costo
          </TabsTrigger>
          <TabsTrigger 
            value="empleados" 
            className="flex items-center gap-2"
            disabled={!centroCostoCreado}
          >
            <Users className="w-4 h-4" />
            Empleados ({empleadosAsignados.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Crear Centro de Costo */}
        <TabsContent value="crear">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Información del Centro de Costo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 max-w-2xl">
                  {/* Código */}
                  <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-sm font-medium flex items-center gap-1">
                    
                      Código <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="codigo"
                      {...register("codigo", { required: "Este campo es requerido" })}
                      placeholder="Ej: PROD-LINEA1, VENTAS-NORTE, CALIDAD-CTRL"
                      className="w-full py-3 px-4"
                    />
                    {errors.codigo && (
                      <p className="text-xs text-red-500">{errors.codigo.message}</p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium">
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      {...register("nombre", { required: "Este campo es requerido" })}
                      placeholder="Ej: Línea de Producción 1, Ventas Zona Norte, Control de Calidad"
                      className="w-full text-lg py-3 px-4"
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500">{errors.nombre.message}</p>
                    )}
                  </div>

                  {/* Centro de Costo Padre */}
                  <div className="space-y-2">
                    <Label htmlFor="centroCostoPadre" className="text-sm font-medium">
                      Centro de Costo Padre <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="centroCostoPadre"
                      {...register("centroCostoPadre", { required: "Seleccione un centro de costo padre" })}
                      className="w-full border rounded-md px-3 py-3 text-sm focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Seleccione un centro de costo padre...</option>
                      {centrosCostoPadre.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                          {centro.codigo} - {centro.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.centroCostoPadre && (
                      <p className="text-xs text-red-500">{errors.centroCostoPadre.message}</p>
                    )}
                  </div>

                  {/* Información del Centro de Costo Padre seleccionado */}
                  {centroCostoPadreSeleccionado && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Centro de Costo Padre Seleccionado:</h4>
                      {(() => {
                        const centroPadre = centrosCostoPadre.find(cc => cc.id === parseInt(centroCostoPadreSeleccionado));
                        return centroPadre ? (
                          <div className="text-sm text-blue-700">
                            <p><strong>Código:</strong> {centroPadre.codigo}</p>
                            <p><strong>Nombre:</strong> {centroPadre.nombre}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-8 py-2"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-2 text-white"
              >
                Crear Centro de Costo
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: Empleados con este Centro de Costo */}
        <TabsContent value="empleados">
          {centroCostoCreado && (
            <div className="space-y-6">
              {/* Resumen del Centro de Costo Creado */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Centro de Costo Creado: {centroCostoCreado.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Código</Label>
                      <p className="font-medium text-lg">{centroCostoCreado.codigo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Centro Padre</Label>
                      <p className="font-medium text-lg">
                        {centroCostoCreado.centroCostoPadre?.codigo} - {centroCostoCreado.centroCostoPadre?.nombre}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Estado</Label>
                      <Badge variant="default" className="capitalize text-sm">
                        Activo
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Empleados */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Empleados en este Centro de Costo
                      <Badge variant="outline" className="ml-2">
                        {empleadosAsignados.length}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="filtroEstado" className="text-sm">Filtrar:</Label>
                      <select
                        id="filtroEstado"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                      >
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {empleadosFiltrados.length > 0 ? (
                    <div className="space-y-4">
                      {/* Header de la tabla */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                        <div className="col-span-3">Empleado</div>
                        <div className="col-span-2">Documento</div>
                        <div className="col-span-2">Cargo</div>
                        <div className="col-span-2">Departamento</div>
                        <div className="col-span-2">Turno Actual</div>
                        <div className="col-span-1">Valor/Hora</div>
                      </div>

                      {empleadosFiltrados.map((empleado) => (
                        <div
                          key={empleado.id}
                          className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{empleado.nombre}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {empleado.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="col-span-2 text-sm">
                            {empleado.documento}
                          </div>

                          <div className="col-span-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              {empleado.cargo}
                            </div>
                          </div>

                          <div className="col-span-2 text-sm">
                            {empleado.departamento}
                          </div>

                          <div className="col-span-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {empleado.turnoActual}
                            </div>
                          </div>

                          <div className="col-span-1 text-sm font-medium">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              {empleado.salarioHora}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No hay empleados en este centro de costo</p>
                      <p className="text-sm">Los empleados aparecerán aquí cuando se les asigne este centro de costo</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={crearNuevoCentroCosto}
                  className="flex items-center gap-2 px-6 py-2"
                >
                  <Building className="w-4 h-4" />
                  Crear Otro Centro
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-6 py-2"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}