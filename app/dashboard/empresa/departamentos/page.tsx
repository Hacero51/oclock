"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, Building } from "lucide-react";

function TreeItem({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-4">
      <div
        className="flex items-center cursor-pointer select-none hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200"
        onClick={() => setOpen(!open)}
      >
        {children ? (
          open ? (
            <ChevronDown size={18} className="mr-2 text-gray-500" />
          ) : (
            <ChevronRight size={18} className="mr-2 text-gray-500" />
          )
        ) : (
          <span className="w-6 inline-block" />
        )}
        <Folder size={18} className="mr-3 text-blue-500" />
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      {open && <div className="ml-6 border-l border-gray-200 pl-4">{children}</div>}
    </div>
  );
}

export default function DepartamentosPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <Building className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <TreeItem label="ADMINISTRACIÓN">
          <TreeItem label="HORAS EXTRAS" />
        </TreeItem>
        <TreeItem label="EXTRUDADOS">
          <TreeItem label="ADMINISTRACIÓN">
            <TreeItem label="HORAS EXTRAS" />
          </TreeItem>
          <TreeItem label="PLANTA" />
        </TreeItem>
        <TreeItem label="PRENSADOS">
          <TreeItem label="PLANTA" />
        </TreeItem>
      </div>
    </div>
  );
}
