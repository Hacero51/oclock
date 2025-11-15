"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useState, useEffect } from "react";
import { 
  Calendar,
  Plus,
} from "lucide-react";


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
    //const festivos = generarDiasFestivosAnioActual();
    //setDiasFestivos(festivos);
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="crear" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Día Festivo
          </TabsTrigger>

        </TabsList>

        {/* TAB 1: Crear Día Festivo */}
        <TabsContent value="crear">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
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
      </Tabs>
    </div>
  );
}