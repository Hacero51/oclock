"use client";

import { X } from "lucide-react";
import EmpleadoForm from "./form/create/EmpleadoForm";
import CargoForm from "./form/create/CargoForm";
import CentroCostoForm from "./form/create/CentroCostoForm";
import DiaFestivoForm from "./form/create/DiaFestivoForm";
import DispositivoForm from "./form/create/DispositivoForm";
import HorarioFijoForm from "./form/create/HorarioFijoForm";
import MarcacionForm from "./form/create/MarcacionForm";
import PermisosEIncaForm from "./form/create/PermisosEIncaForm.jsx";
import SucursalForm from "./form/create/SucursalForm";
import TurnoForm from "./form/create/TurnoForm";

export default function CreateModal({ type, onClose }) {
  if (!type) return null;

  const sizes = {
    empleado: "max-w-6xl h-[90vh]",
    dispositivo: "max-w-5xl h-[80vh]",
    horariofijo: "max-w-4xl h-[70vh]",
    turno: "max-w-4xl h-[70vh]",
    centrocosto: "max-w-2xl h-[50vh]",
    sucursal: "max-w-2xl h-[60vh]",
    marcacion: "max-w-2xl h-[55vh]",
    diafestivo: "max-w-2xl h-[55vh]",
    permisoseinca: "max-w-3xl h-[65vh]",
    cargo: "max-w-3xl h-[60vh]",
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
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizes[type]} flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">Crear {type}</h2>
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
