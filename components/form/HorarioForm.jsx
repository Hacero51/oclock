"use client";

export default function EmpleadoForm({ onClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Empleado creado correctamente ✅");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 mt-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Identificación</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 mt-1"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Guardar
      </button>
    </form>
  );
}
