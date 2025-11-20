"use client";

import { X } from "lucide-react";
import UpdateEmpleadoForm from "./form/update/UpdateEmpleadoForm";
import UpdateCargoForm from "./form/update/CargoForm";
import UpdateCentroCostoForm from "./form/update/UpdateCentroCostoForm";
import UpdateDiaFestivoForm from "./form/update/DiaFestivoForm";
import UpdateDispositivoForm from "./form/update/DispositivoForm";
import UpdateHorarioFijoForm from "./form/update/UpdateHorarioFijoForm";
import UpdateMarcacionForm from "./form/update/MarcacionForm";
import UpdatePermisosEIncaForm from "./form/update/PermisosEIncaForm";
import UpdateSucursalForm from "./form/update/UpdateSucursalForm";
import UpdateTurnoForm from "./form/update/UpdateTurnoForm";

export default function UpdateModal({ type, data, onClose }) {
  if (!type) return null;

  const sizes = {
    empleado: "max-w-6xl h-[90vh]",
    dispositivo: "max-w-5xl h-[80vh]",
    horariofijo: "max-w-4xl h-[70vh]",
    turno: "max-w-2xl h-[70vh]",
    centrocosto: "max-w-3xl h-[50vh]",
    sucursal: "max-w-6xl h-[80vh]",
    marcacion: "max-w-2xl h-[55vh]",
    diafestivo: "max-w-2xl h-[55vh]",
    permisoseinca: "max-w-3xl h-[65vh]",
    cargo: "max-w-3xl h-[60vh]",
  };

  const forms = {
    empleado: <UpdateEmpleadoForm data={data} onClose={onClose} />,
    cargo: <UpdateCargoForm data={data} onClose={onClose} />,
    centrocosto: <UpdateCentroCostoForm data={data} onClose={onClose} />,
    diafestivo: <UpdateDiaFestivoForm data={data} onClose={onClose} />,
    dispositivo: <UpdateDispositivoForm data={data} onClose={onClose} />,
    horariofijo: <UpdateHorarioFijoForm data={data} onClose={onClose} />,
    marcacion: <UpdateMarcacionForm data={data} onClose={onClose} />,
    permisoseinca: <UpdatePermisosEIncaForm data={data} onClose={onClose} />,
    sucursal: <UpdateSucursalForm data={data} onClose={onClose} />,
    turno: <UpdateTurnoForm data={data} onClose={onClose} />,
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizes[type]} flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">Editar {type}</h2>
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

