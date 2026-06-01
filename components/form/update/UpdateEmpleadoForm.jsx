"use client";

import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Loader2, Save, X, User, Clock, Phone, Camera, Upload, Briefcase, Filter, Calendar, CheckCircle2, Cpu, Fingerprint, ShieldCheck } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export default function UpdateEmpleadoForm({ data, onClose, refreshData }) {
  const [form, setForm] = useState({
    Oid: "",
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
    Estado: "",
    Cargo: "",
    Jefe: "",
    TiempoExtra: false,
    ValorHora: "",
    PhotoUrl: "",
    AcNumber: "",
    Privilege: "0",
    CardNumber: "",
    AcPassword: "",
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
  const [activeTab, setActiveTab] = useState("employee");

  // CARGAR DATOS DEL EMPLEADO
  useEffect(() => {
    if (data) {
      setForm({
        Oid: data.Oid,
        Document: data.documento || "",
        FullName: data.fullName || "",
        FirstName: data.nombre || "",
        MiddleName: data.segundoNombre || "",
        LastName: data.apellido || "",
        MiddleLast: data.segundoApellido || "",
        Email: data.email || "",
        Birthday: data.fechaNacimiento ? data.fechaNacimiento.substring(0, 10) : "",
        Nacionalidad: data.nacionalidad || "",
        Genero: data.genero || "",
        Direccion: data.direccion || "",
        Sucursal: data.sucursal || "",
        Departamento: data.departamento || "",
        CentroCosto: data.centroCosto || "",
        TurnoActual: data.turnoActual || "",
        RotacionActual: data.rotacionActual || "1",
        ContratoActual: data.contratoActual || "",
        Salario: data.salario || "",
        Estado: data.estado,
        Cargo: data.cargo || "",
        Jefe: data.jefe || "",
        TiempoExtra: data.tiempoExtra || false,
        ValorHora: data.valorHora || "",
        PhotoUrl: data.photoUrl || "",
        AcNumber: data.acNumber || "",
        Privilege: String(data.privilege ?? "0"),
        CardNumber: data.cardNumber || "",
        AcPassword: data.acPassword || "",
      });

      if (data.photoUrl) {
        setPhotoPreview(data.photoUrl);
      }
    }
  }, [data]);

  // CARGAR CATÁLOGOS
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/empleados/data");
        const json = await res.json();
        setCatalogos(json);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // MANEJO DEL FORMULARIO
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // VALIDACIÓN: Nombres solo letras y espacios
    const nameFields = ["FullName", "FirstName", "MiddleName", "LastName", "MiddleLast", "Nacionalidad", "Cargo"];
    if (nameFields.includes(name)) {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
      if (!regex.test(value)) {
        return; // Si no cumple, no actualiza el estado (ignora la entrada)
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (value.toUpperCase ? value.toUpperCase() : value), // Sugerencia: Forzar mayúsculas si se desea
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

  // ENVIAR UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const res = await fetch(`/api/empleados/${form.Oid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Error actualizando empleado");
      }

      const event = new CustomEvent('showToast', {
        detail: {
          message: '✅ Empleado actualizado con éxito',
          type: 'success'
        }
      });
      window.dispatchEvent(event);

      setTimeout(() => {
        if (refreshData) refreshData();
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: '❌ Error actualizando empleado',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-4">
        <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500 font-medium">Cargando información...</p>
      </div>
    );
  }

  // Contenido de cada tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "employee":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* COLUMNA IZQUIERDA - FORMULARIO */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* INFORMACIÓN PERSONAL */}
              <Card className="border-2 border-indigo-100 shadow-sm md:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-100 py-3 md:py-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="p-1.5 md:p-2 bg-indigo-600 rounded-lg">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-800">Información Personal</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-x-8 md:gap-y-5">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Nombre a mostrar:</Label>
                      <Input
                        name="FullName"
                        onlyLetters
                        value={form.FullName}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Fecha de Nacimiento:</Label>
                      <Input
                        name="Birthday"
                        type="date"
                        value={form.Birthday}
                        onChange={handleChange}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                        min="1900-01-01"
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Nombre:</Label>
                      <Input
                        name="FirstName"
                        onlyLetters
                        value={form.FirstName}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Nacionalidad:</Label>
                      <Input
                        name="Nacionalidad"
                        onlyLetters
                        value={form.Nacionalidad}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Ej. Colombiana"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Segundo nombre:</Label>
                      <Input
                        name="MiddleName"
                        onlyLetters
                        value={form.MiddleName}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Género:</Label>
                      <Select value={form.Genero} onValueChange={(v) => handleSelect("Genero", v)}>
                        <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">Masculino</SelectItem>
                          <SelectItem value="f">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Apellido:</Label>
                      <Input
                        name="LastName"
                        onlyLetters
                        value={form.LastName}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2 sm:col-span-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Correo electrónico:</Label>
                      <Input
                        name="Email"
                        type="email"
                        value={form.Email}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Segundo apellido:</Label>
                      <Input
                        name="MiddleLast"
                        onlyLetters
                        value={form.MiddleLast}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Dirección:</Label>
                      <Input
                        name="Direccion"
                        value={form.Direccion}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                        placeholder="..."
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Documento:</Label>
                      <Input
                        name="Document"
                        onlyDocument
                        value={form.Document}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* INFORMACIÓN LABORAL Y LECTOR (TABS) */}
              <Card className="border-2 border-indigo-100 shadow-sm md:shadow-lg overflow-hidden">
                <Tabs defaultValue="laboral" className="w-full">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-100 px-2 md:px-6">
                    <TabsList className="bg-transparent h-10 md:h-14 gap-1 md:gap-4 flex justify-start">
                      <TabsTrigger 
                        value="laboral"
                        className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-3 md:px-6 py-1 md:py-2 rounded-t-lg font-bold transition-all text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-indigo-600"
                      >
                        <Briefcase className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Laboral
                      </TabsTrigger>
                      <TabsTrigger 
                        value="lector"
                        className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-3 md:px-6 py-1 md:py-2 rounded-t-lg font-bold transition-all text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-indigo-600"
                      >
                        <Cpu className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Lector
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="laboral" className="m-0 p-3 md:p-6 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-x-8 md:gap-y-5">
                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Sucursal:</Label>
                        <Select value={form.Sucursal} onValueChange={(v) => handleSelect("Sucursal", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogos.sucursales.map((s) => (
                              <SelectItem key={s.Oid} value={s.Oid}>{s.Description}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Turno Actual:</Label>
                        <Select value={form.TurnoActual} onValueChange={(v) => handleSelect("TurnoActual", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogos.turnos.map((t) => (
                              <SelectItem key={t.Oid} value={t.Oid}>{t.Name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Departamento:</Label>
                        <Select value={form.Departamento} onValueChange={(v) => handleSelect("Departamento", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogos.departamentos.map((d) => (
                              <SelectItem key={d.Oid} value={d.Oid}>{d.FullName || d.Name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Rotación Actual:</Label>
                        <Input
                          name="RotacionActual"
                          type="number"
                          value={form.RotacionActual}
                          onChange={handleChange}
                          className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Centro de Costo:</Label>
                        <Select value={form.CentroCosto} onValueChange={(v) => handleSelect("CentroCosto", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogos.centrosCosto.map((c) => (
                              <SelectItem key={c.Oid} value={c.Oid}>{c.Name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Contrato Actual:</Label>
                        <Select value={form.ContratoActual} onValueChange={(v) => handleSelect("ContratoActual", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indefinido">Indefinido</SelectItem>
                            <SelectItem value="fijo">Término Fijo</SelectItem>
                            <SelectItem value="obra">Obra o Labor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Cargo:</Label>
                        <Input
                          name="Cargo"
                          onlyLetters
                          value={form.Cargo}
                          onChange={handleChange}
                          className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                          placeholder="Ej. Vendedor"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Salario Base:</Label>
                        <Input
                          name="Salario"
                          type="number"
                          value={form.Salario}
                          onChange={handleChange}
                          className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Jefe:</Label>
                        <Select value={form.Jefe} onValueChange={(v) => handleSelect("Jefe", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
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

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Estado:</Label>
                        <Select value={form.Estado} onValueChange={(v) => handleSelect("Estado", v)}>
                          <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activo">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500" />
                                <span className="text-sm">Activo</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="inactivo">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500" />
                                <span className="text-sm">Inactivo</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-gray-700">Valor Hora:</Label>
                        <Input
                          name="ValorHora"
                          type="number"
                          value={form.ValorHora}
                          onChange={handleChange}
                          className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2 sm:col-span-2">
                        <div className="flex items-center space-x-3 h-9 md:h-11 px-3 md:px-4 bg-indigo-50 rounded-lg border border-indigo-200 md:border-2">
                          <Switch
                            checked={form.TiempoExtra}
                            onCheckedChange={(checked) => setForm(prev => ({ ...prev, TiempoExtra: checked }))}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 h-4 w-7 md:h-6 md:w-11"
                          />
                          <Label className="text-xs md:text-sm font-bold text-gray-700 cursor-pointer">
                            Tiempo Extra
                          </Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lector" className="m-0 p-3 md:p-6 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1.5 md:space-y-2">
                          <Label className="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Fingerprint className="h-3 w-3 md:h-4 md:w-4 text-indigo-600" />
                            Número Lector (ID Biométrico):
                          </Label>
                          <Input
                            name="AcNumber"
                            onlyNumbers
                            type="number"
                            value={form.AcNumber}
                            onChange={handleChange}
                            className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                          />
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                          <Label className="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-indigo-600" />
                            Privilegio en el Dispositivo:
                          </Label>
                          <Select value={form.Privilege} onValueChange={(v) => handleSelect("Privilege", v)}>
                            <SelectTrigger className="h-9 md:h-11 border border-gray-300 md:border-2 bg-gray-50 text-sm">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Usuario</SelectItem>
                              <SelectItem value="1">Enrolar</SelectItem>
                              <SelectItem value="2">Supervisor</SelectItem>
                              <SelectItem value="3">Administrador</SelectItem>
                              <SelectItem value="4">Invalido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5 md:space-y-2">
                          <Label className="text-xs md:text-sm font-bold text-gray-700">Número de Tarjeta (RFID):</Label>
                          <Input
                            name="CardNumber"
                            onlyNumbers
                            value={form.CardNumber}
                            onChange={handleChange}
                            className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                          />
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                          <Label className="text-xs md:text-sm font-bold text-gray-700">Contraseña Biométrica:</Label>
                          <Input
                            name="AcPassword"
                            type="password"
                            value={form.AcPassword}
                            onChange={handleChange}
                            className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                            maxLength={8}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-2">
                      <Clock className="h-4 w-4 text-indigo-600 mt-0.5" />
                      <p className="text-[10px] md:text-xs text-indigo-700 italic">
                        Los cambios se sincronizarán con los dispositivos biométricos en el próximo ciclo automático.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* COLUMNA DERECHA - FOTO */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 md:border-2 shadow-sm md:shadow-lg">
                <CardContent className="p-4 md:p-6">
                  <div className="aspect-[4/5] md:aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg md:rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative">
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
                          className="absolute top-1.5 right-1.5 md:top-2 md:right-2 h-6 w-6 md:h-8 md:w-8 p-0"
                        >
                          <X className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
                        <p className="text-xs md:text-sm font-semibold text-gray-500 mb-2 md:mb-4">Sin imagen</p>
                      </>
                    )}
                  </div>

                  <div className="mt-3 md:mt-4 space-y-2">
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
                      className="w-full border border-indigo-300 md:border-2 text-indigo-700 hover:bg-indigo-50 text-xs md:text-sm h-9 md:h-auto py-2"
                      onClick={() => document.getElementById('photo-upload').click()}
                    >
                      <Upload className="mr-2 h-3 w-3 md:h-4 md:w-4" />
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
        );

      case "attendance":
        return (
          <AttendanceTab
            employeeOid={form.Oid}
            employeeDocument={form.Document}
          />
        );



      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-3 md:px-8 py-3 md:py-6 border-b-2 md:border-b-4 border-indigo-800 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="p-1.5 md:p-4 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 md:border-2">
              <User className="h-4 w-4 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-2xl font-bold text-white">Actualice la información del empleado</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 hover:text-white shrink-0"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-gray-200 md:border-b-2 px-1 md:px-6 flex-shrink-0">
        <div className="flex space-x-0.5 md:space-x-2 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setActiveTab("employee")}
            className={`px-2 md:px-6 py-1.5 md:py-2.5 rounded-t-lg font-semibold transition-all text-xs md:text-sm flex items-center whitespace-nowrap min-w-[80px] md:min-w-0 ${activeTab === "employee" ? "bg-indigo-600 text-white shadow-md md:shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="truncate">Empleado</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attendance")}
            className={`px-2 md:px-6 py-1.5 md:py-2.5 rounded-t-lg font-semibold transition-all text-xs md:text-sm flex items-center whitespace-nowrap min-w-[80px] md:min-w-0 ${activeTab === "attendance" ? "bg-indigo-600 text-white shadow-md md:shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="truncate">Asistencia</span>
          </button>

        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        {/* CONTENIDO PRINCIPAL CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-6 xl:p-8">
          <div className="max-w-full">
            {renderTabContent()}
          </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-3 md:px-8 py-3 md:py-5 border-t border-gray-300 md:border-t-2 flex flex-col sm:flex-row justify-end gap-2 md:gap-4 shadow-inner flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saveLoading}
            className="h-9 md:h-12 px-3 md:px-6 border border-gray-400 md:border-2 hover:bg-white hover:border-gray-500 font-semibold text-xs md:text-sm w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="truncate">Cancelar</span>
          </Button>
          <Button
            type="submit"
            disabled={saveLoading}
            className="h-9 md:h-12 px-4 md:px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-md md:shadow-xl border border-indigo-700 md:border-2 text-xs md:text-sm w-full sm:w-auto order-1 sm:order-2 mb-2 sm:mb-0"
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                <span className="truncate">Guardando...</span>
              </>
            ) : (
              <>
                <Save className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">Guardar Cambios</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AttendanceTab({ employeeOid, employeeDocument }) {
  const [periodo, setPeriodo] = useState("15");
  const [registros, setRegistros] = useState([]);
  const [marcaciones, setMarcaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [regPage, setRegPage] = useState(1);
  const [regLimit, setRegLimit] = useState(15);

  const [marcPage, setMarcPage] = useState(1);
  const [marcLimit, setMarcLimit] = useState(15);

  useEffect(() => {
    setRegPage(1);
    setMarcPage(1);
  }, [periodo, refreshKey]);

  const paginatedRegistros = registros.slice((regPage - 1) * regLimit, regPage * regLimit);
  const paginatedMarcaciones = marcaciones.slice((marcPage - 1) * marcLimit, marcPage * marcLimit);

  // Estados para edición inline
  const [editandoId, setEditandoId] = useState(null);
  const [editandoTipo, setEditandoTipo] = useState(null); // "entrada" o "salida"
  const [valorEditado, setValorEditado] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // UTILIDADES DE FECHA
  const parsearFechaHora = (fechaStr) => {
    if (!fechaStr || fechaStr === "-" || fechaStr === "N/A" || fechaStr.includes("SIN SALIDA")) return "";
    try {
      // Formato esperado: DD/MM/YYYY HH:MM AM/PM
      const [fechaPart, horaPart, ampm] = fechaStr.split(" ");
      const [dia, mes, anio] = fechaPart.split("/").map(Number);
      let [hora, min] = horaPart.split(":").map(Number);

      if (ampm === "PM" && hora < 12) hora += 12;
      if (ampm === "AM" && hora === 12) hora = 0;

      const fecha = new Date(anio, mes - 1, dia, hora, min);
      if (isNaN(fecha.getTime())) return "";

      const lYear = fecha.getFullYear();
      const lMonth = String(fecha.getMonth() + 1).padStart(2, '0');
      const lDay = String(fecha.getDate()).padStart(2, '0');
      const lHour = String(fecha.getHours()).padStart(2, '0');
      const lMin = String(fecha.getMinutes()).padStart(2, '0');

      return `${lYear}-${lMonth}-${lDay}T${lHour}:${lMin}`;
    } catch (e) {
      console.error("Error parseando fecha:", fechaStr, e);
      return "";
    }
  };

  const obtenerFechaActual = () => {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - offset).toISOString().slice(0, 16);
  };

  const validarMarcacion = (tipo, valor, otraMarcacion) => {
    if (!valor) return { valido: false, mensaje: "La fecha no puede estar vacía" };
    const fechaActual = new Date(valor);
    const ahora = new Date();

    if (fechaActual > ahora) {
      return { valido: false, mensaje: "No puede ser una fecha futura" };
    }

    if (otraMarcacion && otraMarcacion !== "-" && otraMarcacion !== "N/A") {
      const parsedOtra = parsearFechaHora(otraMarcacion);
      if (parsedOtra) {
        const fechaOtra = new Date(parsedOtra);
        if (tipo === "salida" && fechaActual < fechaOtra) {
          return { valido: false, mensaje: "La salida no puede ser anterior a la entrada" };
        }
        if (tipo === "entrada" && fechaActual > fechaOtra) {
          return { valido: false, mensaje: "La entrada no puede ser posterior a la salida" };
        }
      }
    }
    return { valido: true, mensaje: "" };
  };

  // HANDLERS
  const iniciarEdicion = (m, tipo) => {
    setEditandoId(m.id);
    setEditandoTipo(tipo);
    const actual = tipo === "entrada" ? m.entrada : m.salida;
    const parsed = parsearFechaHora(actual);
    setValorEditado(parsed || obtenerFechaActual());
    setErrorValidacion("");
  };

  const guardarCambio = async (m) => {
    const validacion = validarMarcacion(editandoTipo, valorEditado, editandoTipo === "entrada" ? m.salida : m.entrada);
    if (!validacion.valido) {
      setErrorValidacion(validacion.mensaje);
      return;
    }

    setIsSaving(true);
    try {
      const body = { id: m.id };
      body[editandoTipo] = valorEditado;

      const res = await fetch('/api/marcaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Error guardando marcación");

      setEditandoId(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setErrorValidacion("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function fetchAttendance() {
      if (!employeeOid && !employeeDocument) return;
      setLoading(true);
      try {
        const query = employeeDocument || employeeOid;

        // Calcular fechas según periodo
        const hasta = new Date().toISOString().split('T')[0];
        const desdeDate = new Date();
        if (periodo !== "all") {
          desdeDate.setDate(desdeDate.getDate() - parseInt(periodo));
        } else {
          desdeDate.setFullYear(desdeDate.getFullYear() - 1); // 1 año si es 'todos'
        }
        const desde = desdeDate.toISOString().split('T')[0];

        // Fetch Registros
        const resReg = await fetch(`/api/registros?empleado=${query}&desde=${desde}&hasta=${hasta}&limit=100`);
        const dataReg = await resReg.json();
        setRegistros(dataReg.data || []);

        // Fetch Marcaciones
        const resMarc = await fetch(`/api/marcaciones?empleado=${query}&desde=${desde}&hasta=${hasta}&limit=100`);
        const dataMarc = await resMarc.json();
        setMarcaciones(dataMarc.data || []);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [employeeOid, employeeDocument, periodo, refreshKey]);

  return (
    <Card className="border border-indigo-100 md:border-2 shadow-sm md:shadow-lg overflow-hidden">
      <Tabs defaultValue="registro" className="w-full">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200 py-2 md:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 px-2">
            <TabsList className="bg-gray-200/50 p-1 h-8 md:h-10 w-full sm:w-auto">
              <TabsTrigger
                value="registro"
                className="text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold"
              >
                Registro
              </TabsTrigger>
              <TabsTrigger
                value="marcacion"
                className="text-xs px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold"
              >
                Marcación
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-3 w-3 text-gray-400" />
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="h-8 text-[10px] w-full sm:w-[140px] bg-white border-gray-300">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Últimos 15 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="60">Últimos 60 días</SelectItem>
                  <SelectItem value="all">Todo el historial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <TabsContent value="registro" className="m-0 border-none">
          <CardContent className="p-0 overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-xs text-gray-400">Cargando registros...</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Tiempo</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3">Lector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRegistros.length > 0 ? (
                    paginatedRegistros.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] whitespace-nowrap">
                          {(() => {
                            const date = new Date(r.tiempo);
                            const dia = String(date.getUTCDate()).padStart(2, '0');
                            const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
                            const anio = date.getUTCFullYear();
                            let horas = date.getUTCHours();
                            const mins = String(date.getUTCMinutes()).padStart(2, '0');
                            const ampm = horas >= 12 ? 'PM' : 'AM';
                            horas = horas % 12 || 12;
                            return `${dia}/${mes}/${anio}, ${horas}:${mins} ${ampm}`;
                          })()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.tipo === "Entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                            {r.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px]">{r.metodoverificacion}</td>
                        <td className="px-4 py-2.5 text-[11px] text-gray-500">{r.lector}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-400 italic text-xs">
                        No se encontraron registros en este periodo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
          {!loading && (
            <Pagination
              currentPage={regPage}
              totalPages={Math.ceil(registros.length / regLimit) || 1}
              totalItems={registros.length}
              itemsPerPage={regLimit}
              onPageChange={setRegPage}
              onItemsPerPageChange={setRegLimit}
              pageSizeOptions={[15, 60, 100]}
              label="registros"
            />
          )}
        </TabsContent>

        <TabsContent value="marcacion" className="m-0 border-none">
          <CardContent className="p-0 overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-xs text-gray-400">Cargando marcaciones...</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Entrada</th>
                    <th className="px-4 py-3">Salida</th>
                    <th className="px-4 py-3">Turno</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedMarcaciones.length > 0 ? (
                    paginatedMarcaciones.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] font-medium whitespace-nowrap">
                          {m.fecha}
                        </td>
                        {/* CELDA ENTRADA */}
                        <td className="px-4 py-2.5 text-[11px]">
                          {editandoId === m.id && editandoTipo === "entrada" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="datetime-local"
                                value={valorEditado}
                                onChange={(e) => setValorEditado(e.target.value)}
                                className="h-7 text-[10px] w-32 p-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-green-600"
                                onClick={() => guardarCambio(m)}
                                disabled={isSaving}
                              >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-600"
                                onClick={() => setEditandoId(null)}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {errorValidacion && <span className="absolute mt-14 bg-red-500 text-white text-[8px] p-1 rounded z-10">{errorValidacion}</span>}
                            </div>
                          ) : (
                            <div
                              onClick={() => iniciarEdicion(m, "entrada")}
                              className={`cursor-pointer p-1 rounded hover:bg-indigo-50 transition-colors ${!m.entrada || m.entrada === "-" ? "text-red-400 italic bg-red-50/30" : ""}`}
                            >
                              {m.entrada || "-"}
                            </div>
                          )}
                        </td>
                        {/* CELDA SALIDA */}
                        <td className="px-4 py-2.5 text-[11px]">
                          {editandoId === m.id && editandoTipo === "salida" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="datetime-local"
                                value={valorEditado}
                                onChange={(e) => setValorEditado(e.target.value)}
                                className="h-7 text-[10px] w-32 p-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-green-600"
                                onClick={() => guardarCambio(m)}
                                disabled={isSaving}
                              >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-600"
                                onClick={() => setEditandoId(null)}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {errorValidacion && <span className="absolute mt-14 bg-red-500 text-white text-[8px] p-1 rounded z-10">{errorValidacion}</span>}
                            </div>
                          ) : (
                            <div
                              onClick={() => iniciarEdicion(m, "salida")}
                              className={`cursor-pointer p-1 rounded hover:bg-indigo-50 transition-colors ${!m.salida || m.salida === "-" ? "text-yellow-600 italic bg-yellow-50/30" : ""}`}
                            >
                              {m.salida || "-"}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-gray-500">{m.turno || "N/A"}</td>
                        <td className="px-4 py-2.5">
                          {m.entrada && m.salida && m.entrada !== "-" && m.salida !== "-" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-yellow-400" title="Incompleto" />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400 italic text-xs">
                        No se encontraron marcaciones en este periodo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
          {!loading && (
            <Pagination
              currentPage={marcPage}
              totalPages={Math.ceil(marcaciones.length / marcLimit) || 1}
              totalItems={marcaciones.length}
              itemsPerPage={marcLimit}
              onPageChange={setMarcPage}
              onItemsPerPageChange={setMarcLimit}
              pageSizeOptions={[15, 60, 100]}
              label="marcaciones"
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}