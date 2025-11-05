"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useState } from "react";
import { 
  User, 
  Phone, 
  FileText, 
  Clock,
  MapPin,
  Building,
  DollarSign,
  Upload
} from "lucide-react";

export default function EmpleadoForm({ onClose }) {
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("empleado");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Empleado guardado:", data);
    onClose?.();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-6xl mx-auto"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="empleado" className="flex items-center gap-2 data-[state=active]:bg-white">
            <User className="w-4 h-4" />
            Empleado
          </TabsTrigger>
          <TabsTrigger value="lector" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Clock className="w-4 h-4" />
            Lector
          </TabsTrigger>
          <TabsTrigger value="telefono" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Phone className="w-4 h-4" />
            Teléfonos
          </TabsTrigger>
          <TabsTrigger value="contratos" className="flex items-center gap-2 data-[state=active]:bg-white">
            <FileText className="w-4 h-4" />
            Contratos
          </TabsTrigger>
        </TabsList>

        {/* === TAB EMPLEADO === */}
        <TabsContent value="empleado" className="space-y-6">
          {/* Datos Personales */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Columna 1 - Información básica */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    {...register("nombre", { required: "Campo requerido" })}
                    placeholder="Nombre"
                    className="w-full"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segundoNombre" className="text-sm font-medium">
                    Segundo Nombre
                  </Label>
                  <Input
                    id="segundoNombre"
                    {...register("segundoNombre")}
                    placeholder="Segundo nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-sm font-medium">
                    Apellido
                  </Label>
                  <Input 
                    id="apellido"
                    {...register("apellido")} 
                    placeholder="Apellido" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segundoApellido" className="text-sm font-medium">
                    Segundo Apellido
                  </Label>
                  <Input
                    id="segundoApellido"
                    {...register("segundoApellido")}
                    placeholder="Segundo apellido"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento" className="text-sm font-medium">
                    Documento
                  </Label>
                  <Input 
                    id="documento"
                    {...register("documento")} 
                    placeholder="Documento" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    {...register("email")}
                    placeholder="correo@empresa.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento" className="text-sm font-medium">
                    Fecha de Nacimiento
                  </Label>
                  <Input 
                    id="fechaNacimiento"
                    type="date" 
                    {...register("fechaNacimiento")} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero" className="text-sm font-medium">
                    Género
                  </Label>
                  <select
                    id="genero"
                    {...register("genero")}
                    className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
                  >
                    <option value="">Seleccione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nacionalidad" className="text-sm font-medium">
                    Nacionalidad
                  </Label>
                  <Input
                    id="nacionalidad"
                    {...register("nacionalidad")}
                    placeholder="Nacionalidad"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <Label htmlFor="direccion" className="text-sm font-medium">
                    Dirección
                  </Label>
                  <Input 
                    id="direccion"
                    {...register("direccion")} 
                    placeholder="Dirección completa" 
                  />
                </div>
              </div>

              {/* Columna 2 - Foto del empleado */}
              <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="w-40 h-48 bg-white border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Vista previa"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <Label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    Seleccionar foto
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-gray-500">
                    PNG, JPG hasta 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos Laborales */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                Información Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sucursal" className="text-sm font-medium">
                  Sucursal
                </Label>
                <Input 
                  id="sucursal"
                  {...register("sucursal")} 
                  placeholder="Sucursal" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departamento" className="text-sm font-medium">
                  Departamento
                </Label>
                <Input 
                  id="departamento"
                  {...register("departamento")} 
                  placeholder="Departamento" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="centroCosto" className="text-sm font-medium">
                  Centro de Costo
                </Label>
                <Input
                  id="centroCosto"
                  {...register("centroCosto")}
                  placeholder="Centro de costo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo" className="text-sm font-medium">
                  Cargo
                </Label>
                <Input 
                  id="cargo"
                  {...register("cargo")} 
                  placeholder="Cargo" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="turnoActual" className="text-sm font-medium">
                  Turno Actual
                </Label>
                <Input
                  id="turnoActual"
                  {...register("turnoActual")}
                  placeholder="Ej: PLANTA 6AM-2PM"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salario" className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Salario Base
                </Label>
                <Input 
                  id="salario"
                  type="number" 
                  step="0.01" 
                  {...register("salario")} 
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium">
                  Estado
                </Label>
                <select
                  id="estado"
                  {...register("estado")}
                  className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
                >
                  <option value="">Seleccione...</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="licencia">Licencia</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3 pt-6">
                <input 
                  id="tiempoExtra"
                  type="checkbox" 
                  {...register("tiempoExtra")} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="tiempoExtra" className="text-sm font-medium cursor-pointer">
                  Habilitar Tiempo Extra
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === OTROS TABS === */}
        <TabsContent value="lector">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configuración de Lector de Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Configuración de lector</p>
                <p className="text-sm">Próximamente disponible...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telefono">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Gestión de Teléfonos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Gestión de teléfonos</p>
                <p className="text-sm">Próximamente disponible...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contratos">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información de Contratos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Información de contratos</p>
                <p className="text-sm">Próximamente disponible...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="px-6 py-2"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 shadow-md"
        >
          Guardar Empleado
        </Button>
      </div>
    </form>
  );
}

