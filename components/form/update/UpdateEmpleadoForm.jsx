"use client";

import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Loader2, Save, X, User, Clock, Phone, Camera, Upload, Briefcase } from "lucide-react";

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
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [catalogos, setCatalogos] = useState({
    sucursales: [],
    departamentos: [],
    centrosCosto: [],
    turnos: [],
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
                        value={form.FirstName}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-gray-700">Nacionalidad:</Label>
                      <Input
                        name="Nacionalidad"
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
                        value={form.Document}
                        onChange={handleChange}
                        className="h-9 md:h-11 border border-gray-300 md:border-2 focus:border-indigo-500 bg-gray-50 focus:bg-white text-sm"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* INFORMACIÓN LABORAL */}
              <Card className="border-2 border-blue-100 shadow-sm md:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 py-3 md:py-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="p-1.5 md:p-2 bg-blue-600 rounded-lg">
                      <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-800">Información Laboral</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 bg-white">
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
                            <SelectItem key={d.Oid} value={d.Oid}>{d.Name}</SelectItem>
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
                </CardContent>
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
          <Card className="border border-gray-200 md:border-2">
            <CardContent className="p-8 md:p-12 text-center">
              <Clock className="h-10 w-10 md:h-16 md:w-16 text-gray-300 mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-gray-500 font-medium">Información de asistencia disponible próximamente</p>
              <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">Se conectará con el módulo de marcaciones</p>
            </CardContent>
          </Card>
        );

      case "contact":
        return (
          <Card className="border border-gray-200 md:border-2">
            <CardContent className="p-8 md:p-12 text-center">
              <Phone className="h-10 w-10 md:h-16 md:w-16 text-gray-300 mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-gray-500 font-medium">Información de contacto disponible próximamente</p>
            </CardContent>
          </Card>
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
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`px-2 md:px-6 py-1.5 md:py-2.5 rounded-t-lg font-semibold transition-all text-xs md:text-sm flex items-center whitespace-nowrap min-w-[80px] md:min-w-0 ${activeTab === "contact" ? "bg-indigo-600 text-white shadow-md md:shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="truncate">Contacto</span>
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