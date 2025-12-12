"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Building,
  X,
  Save,
  Loader2,
} from "lucide-react";


export default function CentroCostoForm({ onClose }) {

  const [form, setForm] = useState({
    Code: "",
    Name: "",
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});


  // MANEJO DEL FORMULARIO
  const handleChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN: Nombre solo letras y espacios
    if (name === "Name") {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
      if (!regex.test(value)) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // VALIDACIÓN DEL FORMULARIO
  const validateForm = () => {
    const newErrors = {};

    if (!form.Name.trim()) {
      newErrors.Name = "El nombre es obligatorio";
    }

    if (form.Code && form.Code.length > 20) {
      newErrors.Code = "El código no puede tener más de 20 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ENVIAR CREATE (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    setErrors({});

    // Preparar payload (NO enviar Oid desde el frontend)
    const payload = {
      Code: form.Code.trim() || null,
      Name: form.Name.trim(),
    };

    console.log("Enviando datos:", payload);

    try {
      const res = await fetch("/api/centrocostos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Error del servidor
        throw new Error(responseData.error || "Error creando centro de costo");
      }

      console.log("✅ Respuesta del servidor:", responseData);

      // DISPARAR EVENTO PARA REFRESCAR LA LISTA
      const refreshEvent = new CustomEvent('refreshCentroCostosList');
      window.dispatchEvent(refreshEvent);

      // Mostrar toast de éxito
      const toastEvent = new CustomEvent('showToast', {
        detail: {
          message: '✅ Centro de costo creado con éxito',
          type: 'success'
        }
      });
      window.dispatchEvent(toastEvent);

      // Cerrar después de un segundo
      setTimeout(() => {
        onClose();
        // Opcional: refrescar la lista de centros de costo
        window.dispatchEvent(new CustomEvent('refreshCentrosCosto'));
      }, 1000);

    } catch (error) {
      console.error("❌ Error:", error);

      // Mostrar toast de error
      const event = new CustomEvent('showToast', {
        detail: {
          message: `❌ ${error.message}`,
          type: 'error'
        }
      });
      window.dispatchEvent(event);

      // Mostrar error en el formulario si es de validación
      if (error.message.includes("obligatorio") || error.message.includes("Ya existe")) {
        setErrors(prev => ({
          ...prev,
          form: error.message
        }));
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <Card>
          <CardHeader className="pb-4 bg-blue-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building className="w-5 h-5" />
              </div>
              Información del Centro de Costo
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {/* Error general del formulario */}
            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {errors.form}
              </div>
            )}

            <div className="space-y-6 max-w-2xl">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="Code" className="text-sm font-medium flex items-center gap-1">
                  Código
                </Label>
                <Input
                  name="Code"
                  value={form.Code}
                  onChange={handleChange}
                  placeholder="Ej: 184, 201, CC001"
                  className="w-full py-3 px-4"
                  disabled={saveLoading}
                />
                {errors.Code && (
                  <p className="text-sm text-red-600">{errors.Code}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="Name" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="Name"
                  value={form.Name}
                  onChange={handleChange}
                  placeholder="Ej: Línea de Producción 1, Ventas Zona Norte"
                  className="w-full text-lg py-3 px-4"
                  disabled={saveLoading}
                  required
                />
                {errors.Name && (
                  <p className="text-sm text-red-600">{errors.Name}</p>
                )}
                <p className="text-sm text-gray-500">
                  Este campo es obligatorio. Describe claramente el centro de costo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saveLoading}
            className="sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={saveLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto"
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crear Centro de Costo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}