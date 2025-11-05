"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useState, useEffect } from "react";
import { 
  Calendar,
  Plus,
  Trash2,
  Edit,
  Clock,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

// Generar lista de días festivos del año actual
const generarDiasFestivosAnioActual = () => {
  const anioActual = new Date().getFullYear();
  return [
    {
      id: 1,
      nombre: "Año Nuevo",
      fecha: `${anioActual}-01-01`,
      tipo: "Nacional",
      recurrente: true,
      estado: "activo"
    },
    {
      id: 2,
      nombre: "Día del Trabajo",
      fecha: `${anioActual}-05-01`,
      tipo: "Nacional",
      recurrente: true,
      estado: "activo"
    },
    {
      id: 3,
      nombre: "Grito de Independencia",
      fecha: `${anioActual}-09-16`,
      tipo: "Nacional",
      recurrente: true,
      estado: "activo"
    },
    {
      id: 4,
      nombre: "Navidad",
      fecha: `${anioActual}-12-25`,
      tipo: "Nacional",
      recurrente: true,
      estado: "activo"
    },
    {
      id: 5,
      nombre: "Día de la Revolución",
      fecha: `${anioActual}-11-20`,
      tipo: "Nacional",
      recurrente: true,
      estado: "inactivo"
    }
  ];
};

export default function DiaFestivoForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("crear");
  const [diasFestivos, setDiasFestivos] = useState([]);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      nombre: "",
      fecha: "",
      tipo: "nacional",
      recurrente: true,
      descripcion: "",
      estado: "activo"
    }
  });

  const estado = watch("estado");

  // Cargar días festivos del año actual al montar el componente
  useEffect(() => {
    const festivos = generarDiasFestivosAnioActual();
    setDiasFestivos(festivos);
  }, []);

  const onSubmit = async (data) => {
    try {
      console.log("Creando día festivo:", data);
      
      const nuevoDiaFestivo = {
        id: Date.now(),
        ...data,
        fechaCreacion: new Date().toISOString(),
        usuarioCreacion: "Usuario Actual" // En una app real, esto vendría del contexto de autenticación
      };

      // Agregar a la lista
      setDiasFestivos(prev => [nuevoDiaFestivo, ...prev]);
      
      // Limpiar formulario
      reset();
      
      // Mostrar mensaje de éxito
      alert("Día festivo creado exitosamente");
      
    } catch (error) {
      console.error("Error creando día festivo:", error);
    }
  };

  const eliminarDiaFestivo = (id) => {
    if (window.confirm("¿Está seguro de eliminar este día festivo?")) {
      setDiasFestivos(prev => prev.filter(festivo => festivo.id !== id));
    }
  };

  const toggleEstado = (id) => {
    setDiasFestivos(prev => 
      prev.map(festivo => 
        festivo.id === id 
          ? { ...festivo, estado: festivo.estado === "activo" ? "inactivo" : "activo" }
          : festivo
      )
    );
  };

  const diasFestivosActivos = diasFestivos.filter(festivo => festivo.estado === "activo");
  const diasFestivosInactivos = diasFestivos.filter(festivo => festivo.estado === "inactivo");

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="crear" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Día Festivo
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lista ({diasFestivos.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Crear Día Festivo */}
        <TabsContent value="crear">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Crear Nuevo Día Festivo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna 1 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">
                        Nombre del Día Festivo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombre"
                        {...register("nombre", { required: "Este campo es requerido" })}
                        placeholder="Ej: Año Nuevo, Día del Trabajo, Navidad"
                        className="w-full"
                      />
                      {errors.nombre && (
                        <p className="text-xs text-red-500">{errors.nombre.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha" className="text-sm font-medium">
                        Fecha <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fecha"
                        type="date"
                        {...register("fecha", { required: "Este campo es requerido" })}
                        className="w-full"
                      />
                      {errors.fecha && (
                        <p className="text-xs text-red-500">{errors.fecha.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-sm font-medium">
                        Tipo
                      </Label>
                      <select
                        id="tipo"
                        {...register("tipo")}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="nacional">Nacional</option>
                        <option value="regional">Regional</option>
                        <option value="local">Local</option>
                        <option value="empresa">Empresa</option>
                      </select>
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium">
                        Estado
                      </Label>
                      <select
                        id="estado"
                        {...register("estado")}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="recurrente"
                        type="checkbox"
                        {...register("recurrente")}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="recurrente" className="text-sm font-medium cursor-pointer">
                        Día recurrente (se repite cada año)
                      </Label>
                    </div>

                    {/* Estado visual */}
                    <div className={`p-3 rounded-lg border ${
                      estado === "activo" 
                        ? "bg-green-50 border-green-200" 
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        {estado === "activo" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          estado === "activo" ? "text-green-800" : "text-gray-800"
                        }`}>
                          {estado === "activo" ? "Día festivo activo" : "Día festivo inactivo"}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${
                        estado === "activo" ? "text-green-600" : "text-gray-600"
                      }`}>
                        {estado === "activo" 
                          ? "Este día festivo será considerado en los cálculos" 
                          : "Este día festivo no será considerado en los cálculos"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Descripción - Ancho completo */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium">
                      Descripción / Notas
                    </Label>
                    <Textarea
                      id="descripcion"
                      {...register("descripcion")}
                      placeholder="Descripción adicional o notas sobre este día festivo..."
                      rows={3}
                    />
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
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Día Festivo
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: Lista de Días Festivos */}
        <TabsContent value="lista">
          <div className="space-y-6">
            {/* Resumen */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Días Festivos {anioActual}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{diasFestivos.length}</p>
                    <p className="text-blue-800">Total Días Festivos</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{diasFestivosActivos.length}</p>
                    <p className="text-green-800">Días Activos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{diasFestivosInactivos.length}</p>
                    <p className="text-gray-800">Días Inactivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Días Festivos */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Lista de Días Festivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {diasFestivos.length > 0 ? (
                  <div className="space-y-4">
                    {diasFestivos.map((festivo) => (
                      <div
                        key={festivo.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          festivo.estado === "activo" 
                            ? "bg-green-50 border-green-200" 
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            festivo.estado === "activo" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">{festivo.nombre}</p>
                            <p className="text-sm text-gray-600">
                              {formatearFecha(festivo.fecha)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={festivo.estado === "activo" ? "default" : "secondary"}
                                className="capitalize text-xs"
                              >
                                {festivo.estado}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {festivo.tipo}
                              </Badge>
                              {festivo.recurrente && (
                                <Badge variant="outline" className="text-xs">
                                  Recurrente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEstado(festivo.id)}
                            className={festivo.estado === "activo" 
                              ? "text-orange-600 border-orange-300" 
                              : "text-green-600 border-green-300"
                            }
                          >
                            {festivo.estado === "activo" ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarDiaFestivo(festivo.id)}
                            className="text-red-600 border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No hay días festivos registrados</p>
                    <p className="text-sm">Crea el primer día festivo usando el formulario</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auditoría */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Usuario</Label>
                    <p className="font-medium">Admin Sistema</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Fecha de Actualización</Label>
                    <p className="font-medium">{new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("crear")}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Nuevo Día Festivo
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}