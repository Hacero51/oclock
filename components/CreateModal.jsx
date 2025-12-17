"use client";

import { X } from "lucide-react";
import EmpleadoForm from "./form/create/EmpleadoForm";
import CargoForm from "./form/create/CargoForm";
import CentroCostoForm from "./form/create/CentroCostoForm";
import DiaFestivoForm from "./form/create/DiaFestivoForm";
import DispositivoForm from "./form/create/DispositivoForm";
import HorariosForm from "./form/create/HorariosForm";
import MarcacionForm from "./form/create/MarcacionForm";
import PermisosEIncaForm from "./form/create/PermisosEIncaForm.jsx";
import SucursalForm from "./form/create/SucursalForm";
import TurnoForm from "./form/create/TurnoForm";

export default function CreateModal({ type, onClose }) {
  if (!type) return null;

  const sizes = {
    Empleado: "max-w-6xl h-[90vh]",
    Dispositivo: "max-w-5xl h-[80vh]",
    Horarios: "max-w-4xl h-[70vh]",
    Turno: "max-w-6xl h-[90vh]",
    "Centro Costo": "max-w-2xl h-[50vh]",
    Sucursal: "max-w-2xl h-[60vh]",
    Marcacion: "max-w-2xl h-[55vh]",
    "Dia Festivo": "max-w-2xl h-[55vh]",
    "Permisos E Incapacidades": "max-w-3xl h-[65vh]",
    Cargo: "max-w-3xl h-[60vh]",
  };


  const forms = {
    Empleado: <EmpleadoForm onClose={onClose} />,
    Cargo: <CargoForm onClose={onClose} />,
    "Centro Costo": <CentroCostoForm onClose={onClose} />,
    "Dia Festivo": <DiaFestivoForm onClose={onClose} />,
    Dispositivo: <DispositivoForm onClose={onClose} />,
    Horarios: <HorariosForm onClose={onClose} />,
    Marcacion: <MarcacionForm onClose={onClose} />,
    "Permisos E Incapacidades": <PermisosEIncaForm onClose={onClose} />,
    Sucursal: <SucursalForm onClose={onClose} />,
    Turno: <TurnoForm onClose={onClose} />,
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizes[type]} flex flex-col overflow-hidden pointer-events-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-red-600 sticky top-0 z-10">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {forms[type] ?? (
            <div className="text-center text-gray-500">
              Formulario no disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
