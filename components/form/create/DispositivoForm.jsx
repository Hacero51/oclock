"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useState, useEffect } from "react";
import { 
  Smartphone,
  Building,
  Download,
  Database,
  Filter,
  X,
  Settings2,
  Globe,
  Clock,
  ShieldCheck
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Datos de ejemplo - Inicializados vacíos para producción
const empleadosEjemplo = [];

export default function DispositivoForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [tipoConexion, setTipoConexion] = useState("red");
  const [filtroTiempo, setFiltroTiempo] = useState("todos");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      nomeroDispositivos: "", nombre: "", fechaDispositivo: "",
      ip: "192.168.1.100", puerto: "4370", softwareVersion: "v2.1.5",
      tipoConexion: "red", baudRate: "115200", contraseña: "******", puertoSerial: "COM3",
      capacidadUsuarios: "1000", capacidadRegistros: "50000", capacidadHuellas: "3000",
      capacidadRostros: "1000", longitudNumeroLector: "10",
      cantidadadministrador: "0", cantidadcontrasena: "0",
      firware: "", serie: "", versionfingerprint: "",
      cantidadMaximaUsuarios: "1000", cantidadMaximaRegistros: "50000",
      cantidadMaximaHuellas: "3000", cantidadMaximaRostros: "1000"
    }
  });

  const handleTipoConexionChange = (value) => {
    setTipoConexion(value);
    setValue("tipoConexion", value);
  };

  const onSubmit = (data) => {
    console.log("Guardando dispositivo:", data);
    if (onClose) onClose();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans text-gray-900">
      
      {/* Header Premium */}
      <div className="bg-[#1e40af] px-6 py-5 flex items-center justify-between border-b border-blue-800/20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight italic">Reloj Biométrico - Configuración</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/30">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-gray-100 p-1.5 rounded-xl shadow-inner border border-gray-200">
            <TabsTrigger value="informacion" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold text-[11px] uppercase tracking-wider py-2.5">
              <Database className="w-3.5 h-3.5" /> Información
            </TabsTrigger>
            <TabsTrigger value="capacidad" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold text-[11px] uppercase tracking-wider py-2.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Capacidad
            </TabsTrigger>
            <TabsTrigger value="parametros" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold text-[11px] uppercase tracking-wider py-2.5">
              <Globe className="w-3.5 h-3.5" /> Parámetros
            </TabsTrigger>
          </TabsList>

          {/* INFORMACIÓN */}
          <TabsContent value="informacion" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-8">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-[0.2em]">Dispositivo Clock</h3>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Número de Dispositivo</label>
                  <Input {...register("nomeroDispositivos")} className="h-11 bg-gray-50/50 border-gray-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Nombre</label>
                    <Input {...register("nombre")} className="h-11 bg-gray-50/50 border-gray-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Fecha del Dispositivo</label>
                    <Input type="date" {...register("fechaDispositivo")} className="h-11 bg-gray-50/50 border-gray-200" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Conexión</label>
                    <div className="h-11 px-3 flex items-center border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">Desconectado</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Estado</label>
                    <div className="h-11 px-3 flex items-center border border-gray-200 rounded-lg bg-green-50 text-green-700 text-sm font-bold uppercase">Activo</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-[0.2em]">Información Técnica</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Usuarios</label>
                    <Input type="number" {...register("capacidadUsuarios")} className="h-10 bg-gray-50/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Registros</label>
                    <Input type="number" {...register("capacidadRegistros")} className="h-10 bg-gray-50/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Huellas</label>
                    <Input type="number" {...register("capacidadHuellas")} className="h-10 bg-gray-50/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Rostros</label>
                    <Input type="number" {...register("capacidadRostros")} className="h-10 bg-gray-50/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Longitud Número Lector</label>
                    <Input type="number" {...register("longitudNumeroLector")} className="h-10 bg-gray-50/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Accesos Administrador</label>
                    <Input type="number" {...register("cantidadadministrador")} className="h-10 bg-gray-50/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Contraseñas</label>
                    <Input type="number" {...register("cantidadcontrasena")} className="h-10 bg-gray-50/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Firmware</label>
                    <Input {...register("firware")} className="h-10 bg-gray-50/50 font-mono text-[11px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Serie</label>
                    <Input {...register("serie")} className="h-10 bg-gray-50/50 font-mono text-[11px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Version Fingerprint</label>
                    <Input {...register("versionfingerprint")} className="h-10 bg-gray-50/50 font-mono text-[11px]" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CAPACIDAD (RESTAURADA) */}
          <TabsContent value="capacidad" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-8">
              
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Building className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-[0.2em]">Capacidad Máxima</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Cantidad máxima de usuarios</label>
                      <Input type="number" {...register("cantidadMaximaUsuarios")} className="h-11 bg-gray-50/50 border-gray-200" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Cantidad máxima de registros</label>
                      <Input type="number" {...register("cantidadMaximaRegistros")} className="h-11 bg-gray-50/50 border-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-4">   
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Cantidad máxima de huellas</label>
                      <Input type="number" {...register("cantidadMaximaHuellas")} className="h-11 bg-gray-50/50 border-gray-200" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Cantidad máxima de rostros</label>
                      <Input type="number" {...register("cantidadMaximaRostros")} className="h-11 bg-gray-50/50 border-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Registro de entrada y salida */}
              <div className="space-y-4 pt-4">                             
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-[0.2em]">Registro de entrada y salida</h3>
                </div>
                
                {/* Filtro de Tiempo */}
                <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5" /> Filtrar por Tiempo
                    </label>
                  </div>
                  
                  <Select value={filtroTiempo} onValueChange={setFiltroTiempo}>
                    <SelectTrigger className="h-11 bg-white border-gray-200 shadow-sm">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los registros</SelectItem>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="mes-actual">Mes Actual</SelectItem>
                      <SelectItem value="ultimos-7">Últimos 7 días</SelectItem>
                      <SelectItem value="ultimos-30">Últimos 30 días</SelectItem>
                      <SelectItem value="año-actual">Año Actual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de Empleados (Estilizada) */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100/80 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3.5 text-left font-bold uppercase text-gray-400 tracking-wider">Empleado</th>
                        <th className="px-4 py-3.5 text-left font-bold uppercase text-gray-400 tracking-wider">Tiempo</th>
                        <th className="px-4 py-3.5 text-left font-bold uppercase text-gray-400 tracking-wider">Tipo</th>
                        <th className="px-4 py-3.5 text-left font-bold uppercase text-gray-400 tracking-wider">Verificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {empleadosEjemplo.length > 0 ? (
                        empleadosEjemplo.map((empleado) => (
                          <tr key={empleado.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-gray-700">{empleado.nombre}</td>
                            <td className="px-4 py-3.5 text-gray-500">{empleado.tiempo}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[9px] ${
                                empleado.tipo === 'Entrada' ? 'bg-green-100 text-green-700 border border-green-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {empleado.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 font-medium">{empleado.metodo}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-10 text-center text-gray-400 italic bg-gray-50/50">
                            No hay registros de marcaciones para este dispositivo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PARÁMETROS */}
          <TabsContent value="parametros" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-8">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-[0.2em]">Configuración de Red & Acceso</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Dirección IP</label>
                    <Input {...register("ip")} className="h-11 bg-gray-50/50 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Puerto</label>
                    <Input {...register("puerto")} className="h-11 bg-gray-50/50 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Tipo de Conexión</label>
                    <Select value={tipoConexion} onValueChange={handleTipoConexionChange}>
                      <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 shadow-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">Red (Ethernet)</SelectItem>
                        <SelectItem value="serial">Puerto Serial (RS232/485)</SelectItem>
                        <SelectItem value="usb">USB Directo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Baud Rate</label>
                    <Input {...register("baudRate")} className="h-11 bg-gray-50/50 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Contraseña de Comunicación</label>
                    <Input type="password" {...register("contraseña")} className="h-11 bg-gray-50/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block">Versión de Software</label>
                    <Input {...register("softwareVersion")} className="h-11 bg-gray-100 text-gray-400 border-none italic" disabled />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Premium */}
      <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 h-12 font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-10 h-12 font-bold rounded-xl text-xs uppercase tracking-widest shadow-md shadow-red-200 transition-all active:scale-95">Guardar Configuración</Button>
      </div>
    </div>
  );
}