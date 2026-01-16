"use client";

import { X } from "lucide-react";
import UpdateEmpleadoForm from "./form/update/UpdateEmpleadoForm";
import UpdateCargoForm from "./form/update/CargoForm";
import UpdateCentroCostoForm from "./form/update/UpdateCentroCostoForm";
import UpdateDiaFestivoForm from "./form/update/DiaFestivoForm";
import UpdateDispositivoForm from "./form/update/UpdateDispositivoForm";
import UpdateHorariosForm from "./form/update/UpdateHorariosForm";
import UpdateMarcacionForm from "./form/update/MarcacionForm";
import UpdatePermisosEIncaForm from "./form/update/UpdatePermisosEIncaForm";
import UpdateTurnoForm from "./form/update/UpdateTurnoForm";
import UpdateConceptoAsistenciaForm from "./form/update/Updateconceptosasistenciaform";
import UpdateTipoPermisoForm from "./form/update/UpdateTipoPermisoForm";

export default function UpdateModal({ type, data, onClose }) {
  if (!type) return null;

  const sizes = {
    Empleado: "max-w-6xl h-[95vh]",
    dispositivo: "max-w-5xl h-[80vh]",
    Horarios: "max-w-4xl h-[90vh]",
    turno: "max-w-5xl h-[90vh]",
    "Centro de Costo": "max-w-7xl h-[90vh]",
    marcacion: "max-w-2xl h-[55vh]",
    diafestivo: "max-w-2xl h-[55vh]",
    permisoseinca: "max-w-3xl h-[75vh]",
    cargo: "max-w-3xl h-[60vh]",
    conceptosasistencia: "max-w-2xl h-[60vh]",
    tipopermiso: "max-w-2xl h-[60vh]",
  };

  const forms = {
    Empleado: <UpdateEmpleadoForm data={data} onClose={onClose} />,
    cargo: <UpdateCargoForm data={data} onClose={onClose} />,
    "Centro de Costo": <UpdateCentroCostoForm data={data} onClose={onClose} />,
    diafestivo: <UpdateDiaFestivoForm data={data} onClose={onClose} />,
    dispositivo: <UpdateDispositivoForm data={data} onClose={onClose} />,
    Horarios: <UpdateHorariosForm data={data} onClose={onClose} />,
    marcacion: <UpdateMarcacionForm data={data} onClose={onClose} />,
    permisoseinca: <UpdatePermisosEIncaForm data={data} onClose={onClose} />,
    turno: <UpdateTurnoForm data={data} onClose={onClose} />,
    conceptosasistencia: <UpdateConceptoAsistenciaForm data={data} onClose={onClose} />,
    tipopermiso: <UpdateTipoPermisoForm data={data} onClose={onClose} />,
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizes[type]} flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-red-600 sticky top-0 z-10">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {forms[type] ?? (
            <div className="text-center text-gray-500">
              Formulario no disponible update
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

