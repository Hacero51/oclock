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
  Users,
  User,
  Mail,
  Briefcase,
  Clock,
  DollarSign
} from "lucide-react";


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

export default function CentroCostoForm({ data, onClose }) {
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
      </Tabs>
    </div>
  );
}