"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useState } from "react";
import { 
  Briefcase, 
  DollarSign, 
  Code,
  User,
  Users,
  Mail,
  Calendar
} from "lucide-react";

// Datos de ejemplo - en una app real esto vendría de tu API
const empleadosEjemplo = [
  {
    id: 1,
    nombre: "Juan Pérez",
    documento: "12345678",
    email: "juan.perez@empresa.com",
    telefono: "+1 234-567-8900",
    departamento: "Ventas",
    cargoActual: "Vendedor Senior",
    fechaContratacion: "2023-01-15",
    salario: 35000,
    estado: "activo"
  },
  {
    id: 2,
    nombre: "Juan dominguez",
    documento: "12345678",
    email: "juan.perez@empresa.com",
    telefono: "+1 234-567-8900",
    departamento: "Ventas",
    cargoActual: "Vendedor Senior",
    fechaContratacion: "2023-01-15",
    salario: 35000,
    estado: "activo"
  },
];

export default function CargoForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("crear");
  const [cargoCreado, setCargoCreado] = useState(null);
  const [empleadosAsignados, setEmpleadosAsignados] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Simular creación del cargo en la API
      console.log("Creando cargo:", data);
      
      // Aquí iría tu llamada a la API real
      const nuevoCargo = {
        id: Date.now(), // ID temporal
        ...data,
        fechaCreacion: new Date().toISOString(),
        salarioBase: parseFloat(data.salarioBase)
      };

      setCargoCreado(nuevoCargo);
      
      // Simular obtención de empleados con este cargo
      // En una app real, esto sería una consulta a tu API
      const empleadosConEsteCargo = empleadosEjemplo.filter(
        emp => emp.cargoActual.toLowerCase() === data.nombre.toLowerCase()
      );
      
      setEmpleadosAsignados(empleadosConEsteCargo);
      setActiveTab("empleados");
      
    } catch (error) {
      console.error("Error creando cargo:", error);
    }
  };

  const crearNuevoCargo = () => {
    setCargoCreado(null);
    setEmpleadosAsignados([]);
    setActiveTab("crear");
    reset();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="crear" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Crear Cargo
          </TabsTrigger>
          <TabsTrigger 
            value="empleados" 
            className="flex items-center gap-2"
            disabled={!cargoCreado}
          >
            <Users className="w-4 h-4" />
            Empleados ({empleadosAsignados.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Crear Cargo */}
        <TabsContent value="crear">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Información del Cargo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Campos más largos - en una sola columna */}
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium">
                      Nombre del Cargo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      onlyLetters
                      {...register("nombre", { required: "Este campo es requerido" })}
                      placeholder="Ej: Vendedor Senior, Gerente de Marketing, Desarrollador Frontend"
                      className="w-full text-lg py-3 px-4"
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500">{errors.nombre.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-sm font-medium flex items-center gap-1">
                      <Code className="w-4 h-4" />
                      Código <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="codigo"
                      alphanumeric
                      uppercase
                      noSpaces
                      {...register("codigo", { required: "Este campo es requerido" })}
                      placeholder="Ej: VEND-SENIOR, GER-MKT, DEV-FRONT"
                      className="w-full py-3 px-4"
                    />
                    {errors.codigo && (
                      <p className="text-xs text-red-500">{errors.codigo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salarioBase" className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Salario Base <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="salarioBase"
                      type="number"
                      step="0.01"
                      {...register("salarioBase", { 
                        required: "Este campo es requerido",
                        min: { value: 0, message: "El salario debe ser mayor a 0" }
                      })}
                      placeholder="0.00"
                      className="w-full py-3 px-4"
                    />
                    {errors.salarioBase && (
                      <p className="text-xs text-red-500">{errors.salarioBase.message}</p>
                    )}
                  </div>
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
                Crear Cargo
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: Empleados con este Cargo */}
        <TabsContent value="empleados">
          {cargoCreado && (
            <div className="space-y-6">
              {/* Resumen del Cargo Creado */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Cargo Creado: {cargoCreado.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Código</Label>
                      <p className="font-medium text-lg">{cargoCreado.codigo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Salario Base</Label>
                      <p className="font-medium text-lg">${cargoCreado.salarioBase?.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Empleados */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Empleados con este Cargo
                    <Badge variant="outline" className="ml-2">
                      {empleadosAsignados.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {empleadosAsignados.length > 0 ? (
                    <div className="space-y-4">
                      {empleadosAsignados.map((empleado) => (
                        <div
                          key={empleado.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-lg">{empleado.nombre}</p>
                              <p className="text-sm text-gray-500">Doc: {empleado.documento}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{empleado.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Desde {new Date(empleado.fechaContratacion).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge 
                              variant={empleado.estado === "activo" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {empleado.estado}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No hay empleados asignados a este cargo</p>
                      <p className="text-sm">Los empleados aparecerán aquí cuando se les asigne este cargo</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={crearNuevoCargo}
                  className="flex items-center gap-2 px-6 py-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Crear Otro Cargo
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