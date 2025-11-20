"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useState, useRef } from "react";
import { 
  User, 
  Building,
  DollarSign,
  Camera,
  Upload,
  Circle,
  X
} from "lucide-react";

export default function EmpleadoForm({ onClose }) {
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("empleado");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Empleado guardado:", data);
    onClose?.();
  };

  // Funciones para la cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setShowCameraOptions(false);
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
      setShowCameraOptions(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/png');
      setPreview(photoDataUrl);
      setValue("foto", photoDataUrl);
      stopCamera();
    }
  };

  // Funciones para subir archivo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setValue("foto", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Funciones generales para la foto
  const removePhoto = () => {
    setPreview(null);
    setValue("foto", "");
    if (isCameraActive) {
      stopCamera();
    }
    setShowCameraOptions(false);
  };

  const cancelCamera = () => {
    stopCamera();
    setShowCameraOptions(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-6xl mx-auto"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              {/* Vista previa de la foto o cámara */}
              <div className="w-40 h-48 bg-white border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shadow-sm relative">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Foto del empleado"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-red-500 border-dashed pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-xs">Sin foto</span>
                  </div>
                )}
              </div>

              {/* Input de archivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Controles de foto */}
              <div className="flex flex-col gap-2 w-full">
                {!preview && !isCameraActive && !showCameraOptions && (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      onClick={() => setShowCameraOptions(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Camera className="w-4 h-4" />
                      Agregar Foto
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Opcional - Puede omitir este campo
                    </p>
                  </div>
                )}

                {showCameraOptions && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        <Camera className="w-3 h-3" />
                        Usar Cámara
                      </Button>
                      <Button
                        type="button"
                        onClick={triggerFileInput}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <Upload className="w-3 h-3" />
                        Subir Archivo
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShowCameraOptions(false)}
                      variant="outline"
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      onClick={takePhoto}
                      className="bg-green-600 hover:bg-green-700 text-white p-3"
                    >
                      <Circle className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelCamera}
                      variant="outline"
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {preview && (
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      onClick={() => setShowCameraOptions(true)}
                      variant="outline"
                      className="flex items-center gap-2 text-xs"
                    >
                      <Camera className="w-3 h-3" />
                      Cambiar Foto
                    </Button>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="text-xs text-gray-500 text-center space-y-1">
                {preview ? (
                  <p>Foto lista para guardar</p>
                ) : isCameraActive ? (
                  <p>Sonría! Presione el botón para capturar</p>
                ) : showCameraOptions ? (
                  <p>Elija cómo agregar la foto</p>
                ) : (
                  <>
                    <p>Formato: PNG, JPG</p>
                    <p>Máximo: 5MB</p>
                  </>
                )}
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