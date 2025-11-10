"use client";

import { X } from "lucide-react";
import EmpleadoForm from "./form/update/UpdateEmpleadoForm.jsx";
import CargoForm from "./form/update/CargoForm.jsx";
import CentroCostoForm from "./form/update/CentroCostoForm.jsx";
import DiaFestivoForm from "./form/update/DiaFestivoForm.jsx";
import DispositivoForm from "./form/update/DispositivoForm.jsx";
import HorarioFijoForm from "./form/update/HorarioFijoForm.jsx";
import MarcacionForm from "./form/update/MarcacionForm.jsx";
import PermisosEIncaForm from "./form/update/PermisosEIncaForm.jsx";
import SucursalForm from "./form/update/SucursalForm.jsx";
import TurnoForm from "./form/update/TurnoForm.jsx";
import { ca } from "zod/v4/locales";

export default function CreateModal({ type, onClose }) {
  if (!type) return null;

  const getModalSize = () => {
    switch (type) {
      case "empleado":
      case "dispositivo":
        return "max-w-6xl h-[90vh]"; // Más grande para el formulario complejo
      case "turno":
      case "horario":
      case "centrocosto":
      case "horariofijo":
      case "turno":
        return "max-w-4xl h-[60vh]";
      case "marcacion":
      case "sucursal":
      default:
      case "permisoseinca":
        return "max-w-2xl h-[80vh]";
        
    }
  };

  const getTitle = () => {
    const titles = {
      empleado: "Crear Empleado",
      cargo: "Crear Cargo",
      centrocosto: "Crear Centro de Costo",
      diafestivo: "Crear Día Festivo",
      dispositivo: "Crear Dispositivo",
      horariofijo: "Crear Horario Fijo",
      marcacion: "Crear Marcación",
      permisoseinca: "Crear Permisos Incapacidades",
      sucursal: "Crear Sucursal",
      turno: "Crear Turno",
      horario: "Crear Horario"
    };
    return titles[type] || `Crear ${type}`;
  };

  const forms = {
    empleado: <EmpleadoForm onClose={onClose} />,
    cargo: <CargoForm onClose={onClose} />,
    centrocosto: <CentroCostoForm onClose={onClose} />,
    diafestivo: <DiaFestivoForm onClose={onClose} />,
    dispositivo: <DispositivoForm onClose={onClose} />,
    horariofijo: <HorarioFijoForm onClose={onClose} />,
    marcacion: <MarcacionForm onClose={onClose} />,
    permisoseinca: <PermisosEIncaForm onClose={onClose} />,
    sucursal: <SucursalForm onClose={onClose} />,
    turno: <TurnoForm onClose={onClose} />,
    horario: <HorarioForm onClose={onClose} />,
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          bg-white rounded-xl shadow-2xl w-full ${getModalSize()} 
          flex flex-col overflow-hidden animate-scale-in
        `}
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Contenido del Modal - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {forms[type] || (
            <div className="text-center py-8 text-gray-500">
              Formulario no disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
