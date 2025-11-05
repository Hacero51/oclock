"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";

function TreeItem({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-4">
      <div
        className="flex items-center cursor-pointer select-none hover:text-blue-600"
        onClick={() => setOpen(!open)}
      >
        {children ? (
          open ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />
        ) : (
          <span className="w-4 inline-block" />
        )}
        <Folder size={16} className="mr-2 text-yellow-500" />
        {label}
      </div>
      {open && <div className="ml-5">{children}</div>}
    </div>
  );
}

export default function DepartamentosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Departamentos</h1>

      <div className="bg-white rounded-xl shadow-md p-4 border">
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
