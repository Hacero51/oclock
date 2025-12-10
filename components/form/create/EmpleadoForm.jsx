"use client";

import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Save, X, User, Clock, Phone, FileText, Camera, Upload, Briefcase } from "lucide-react";

export default function EmpleadoForm({ onClose }) {
  const [form, setForm] = useState({
    Document: "",
    FullName: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    MiddleLast: "",
    Email: "",
    Birthday: "",
    Nacionalidad: "",
    Genero: "",
    Direccion: "",
    Sucursal: "",
    Departamento: "",
    CentroCosto: "",
    TurnoActual: "",
    RotacionActual: "1",
    ContratoActual: "",
    Salario: "",
    Estado: "activo",
    Cargo: "",
    Jefe: "",
    TiempoExtra: false,
    ValorHora: "",
    PhotoUrl: "",
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [catalogos, setCatalogos] = useState({
    sucursales: [],
    departamentos: [],
    centrosCosto: [],
    turnos: [],
    cargos: [],
    empleados: [],
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // CARGAR CATÁLOGOS
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/empleados/data");
        const json = await res.json();
        //console.log('📥 Datos recibidos en el formulario:', json);
        //console.log('  - Cargos recibidos:', json.cargos?.length || 0);
        //console.log('  - Empleados recibidos:', json.empleados?.length || 0);
        setCatalogos(json);
      } catch (error) {
        //console.error("Error cargando catálogos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // MANEJO DEL FORMULARIO
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // MANEJO DE FOTO
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione una imagen válida');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setForm(prev => ({ ...prev, PhotoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setForm(prev => ({ ...prev, PhotoUrl: "" }));
  };

  // ENVIAR CREATE (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    // Mapeo a camelCase para la API POST
    const payload = {
      documento: form.Document,
      fullName: form.FullName,
      email: form.Email,
      fechaNacimiento: form.Birthday,
      nacionalidad: form.Nacionalidad,
      genero: form.Genero,
      direccion: form.Direccion,
      sucursal: form.Sucursal,
      departamento: form.Departamento,
      centroCosto: form.CentroCosto,
      turnoActual: form.TurnoActual,
      rotacionActual: form.RotacionActual,
      contratoActual: form.ContratoActual,
      estado: form.Estado,
      salario: form.Salario,
      tiempoExtra: form.TiempoExtra,
      valorHora: form.ValorHora,
      cargo: form.Cargo,
      jefe: form.Jefe,
      photoUrl: form.PhotoUrl
    };

    try {
      const res = await fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Error creando empleado");
      }

      const event = new CustomEvent('showToast', {
        detail: {
          message: '✅ Empleado creado con éxito',
          type: 'success'
        }
      });
      window.dispatchEvent(event);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: '❌ Error creando empleado',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setSaveLoading(false);
    }
  };


  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-600  to-blue-700 px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="p-2 md:p-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
              <User className="h-5 w-5 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-white">Crear Nuevo Empleado</h2>
              <p className="text-white-900 mt-1 text-xs md:text-sm hidden sm:block">
                Registre un nuevo empleado en el sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <Tabs defaultValue="employee" className="w-full">
          {/* TABS NAVIGATION */}
          <div className="bg-white border-b-2 border-gray-200 px-2 md:px-6">
            <TabsList className="bg-transparent h-12 md:h-14 gap-1 md:gap-2 w-full flex-wrap md:flex-nowrap">
              <TabsTrigger
                value="employee"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-3 md:px-6 py-2 md:py-2.5 rounded-t-lg font-semibold transition-all text-xs md:text-sm flex-1 md:flex-initial"
              >
                <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Empleado
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-3 md:px-6 py-2 md:py-2.5 rounded-t-lg font-semibold transition-all text-xs md:text-sm flex-1 md:flex-initial"
              >
                <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Asistencia
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-3 md:px-6 py-2 md:py-2.5 rounded-t-lg font-semibold transition-all text-xs md:text-sm flex-1 md:flex-initial"

              >
                <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Contacto
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 md:p-8">
            {/* TAB: EMPLEADO */}
            <TabsContent value="employee" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA IZQUIERDA - FORMULARIO */}
                <div className="lg:col-span-2 space-y-6">
                  {/* INFORMACIÓN PERSONAL */}
                  <Card className="border-2 border-blue-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-red-50 border-b-2 border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Información Personal</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Nombre a mostrar:</Label>
                          <Input
                            name="FullName"
                            value={form.FullName}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="Ej. Juan Pérez"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Fecha de Nacimiento:</Label>
                          <Input
                            name="Birthday"
                            type="date"
                            value={form.Birthday}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Nombre:</Label>
                          <Input
                            name="FirstName"
                            value={form.FirstName}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Nacionalidad:</Label>
                          <Input
                            name="Nacionalidad"
                            value={form.Nacionalidad}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="Ej. Colombiana"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Segundo nombre:</Label>
                          <Input
                            name="MiddleName"
                            value={form.MiddleName}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Género:</Label>
                          <Select value={form.Genero} onValueChange={(v) => handleSelect("Genero", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="m">Masculino</SelectItem>
                              <SelectItem value="f">Femenino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Apellido:</Label>
                          <Input
                            name="LastName"
                            value={form.LastName}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label className="text-sm font-bold text-gray-700">Correo electrónico:</Label>
                          <Input
                            name="Email"
                            type="email"
                            value={form.Email}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="juan@empresa.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Segundo apellido:</Label>
                          <Input
                            name="MiddleLast"
                            value={form.MiddleLast}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Dirección:</Label>
                          <Input
                            name="Direccion"
                            value={form.Direccion}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Documento:</Label>
                          <Input
                            name="Document"
                            value={form.Document}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="Ej. 123456789"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* INFORMACIÓN LABORAL */}
                  <Card className="border-2 border-blue-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Información Laboral</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Sucursal:</Label>
                          <Select value={form.Sucursal} onValueChange={(v) => handleSelect("Sucursal", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogos.sucursales.map((s) => (
                                <SelectItem key={s.Oid} value={s.Oid}>{s.Description}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Turno Actual:</Label>
                          <Select value={form.TurnoActual} onValueChange={(v) => handleSelect("TurnoActual", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogos.turnos.map((t) => (
                                <SelectItem key={t.Oid} value={t.Oid}>{t.Name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Departamento:</Label>
                          <Select value={form.Departamento} onValueChange={(v) => handleSelect("Departamento", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogos.departamentos.map((d) => (
                                <SelectItem key={d.Oid} value={d.Oid}>{d.Name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Rotación Actual:</Label>
                          <Input
                            name="RotacionActual"
                            type="number"
                            value={form.RotacionActual}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Centro de Costo:</Label>
                          <Select value={form.CentroCosto} onValueChange={(v) => handleSelect("CentroCosto", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogos.centrosCosto.map((c) => (
                                <SelectItem key={c.Oid} value={c.Oid}>{c.Name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Contrato Actual:</Label>
                          <Select value={form.ContratoActual} onValueChange={(v) => handleSelect("ContratoActual", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="indefinido">Indefinido</SelectItem>
                              <SelectItem value="fijo">Término Fijo</SelectItem>
                              <SelectItem value="obra">Obra o Labor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Cargo:</Label>
                          <Select value={form.Cargo} onValueChange={(v) => handleSelect("Cargo", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogos.cargos.map((c) => (
                                <SelectItem key={c.Oid} value={c.Oid}>{c.Name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Salario Base:</Label>
                          <Input
                            name="Salario"
                            type="number"
                            value={form.Salario}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Jefe:</Label>
                          <Select value={form.Jefe} onValueChange={(v) => handleSelect("Jefe", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ninguno</SelectItem>
                              {catalogos.empleados.map((e) => (
                                <SelectItem key={e.Oid} value={e.Oid}>{e.Name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Estado:</Label>
                          <Select value={form.Estado} onValueChange={(v) => handleSelect("Estado", v)}>
                            <SelectTrigger className="h-11 border-2 border-gray-300 bg-gray-50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="activo">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                                  Activo
                                </div>
                              </SelectItem>
                              <SelectItem value="inactivo">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                                  Inactivo
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Valor Hora:</Label>
                          <Input
                            name="ValorHora"
                            type="number"
                            value={form.ValorHora}
                            onChange={handleChange}
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 bg-gray-50 focus:bg-white"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 h-11 px-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                            <Switch
                              checked={form.TiempoExtra}
                              onCheckedChange={(checked) => setForm(prev => ({ ...prev, TiempoExtra: checked }))}
                              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                            <Label className="text-sm font-bold text-gray-700 cursor-pointer">
                              Tiempo Extra
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* COLUMNA DERECHA - FOTO */}
                <div className="lg:col-span-1">
                  <Card className="border-2 border-gray-200 shadow-lg sticky top-6">
                    <CardContent className="p-6">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative">
                        {photoPreview ? (
                          <>
                            <img
                              src={photoPreview}
                              alt="Foto empleado"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemovePhoto}
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Camera className="h-16 w-16 text-gray-400 mb-3" />
                            <p className="text-sm font-semibold text-gray-500 mb-4">Sin imagen</p>
                          </>
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => document.getElementById('photo-upload').click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Foto
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          JPG, PNG o GIF (máx. 5MB)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB: ASISTENCIA */}
            <TabsContent value="attendance" className="mt-0">
              <Card className="border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Información de asistencia disponible próximamente</p>
                  <p className="text-sm text-gray-400 mt-2">Se conectará con el módulo de marcaciones</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: CONTACTO */}
            <TabsContent value="contact" className="mt-0">
              <Card className="border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <Phone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Información de contacto disponible próximamente</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* FOOTER ACCIONES */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 md:px-8 py-4 md:py-5 border-t-2 border-gray-300 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 shadow-inner">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saveLoading}
            className="h-10 md:h-12 px-6 md:px-8 border-2 border-gray-400 hover:bg-white hover:border-gray-500 font-semibold text-sm md:text-base w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saveLoading}
            className="h-10 md:h-12 px-8 md:px-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold shadow-xl border-2 border-blue-700 text-sm md:text-base w-full sm:w-auto"
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Crear Empleado
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}