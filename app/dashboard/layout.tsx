"use client";

import { createContext, useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import CreateModal from "@/components/CreateModal";

export const DashboardContext = createContext({
  openCreate: (type: string) => { },
  estadoEmpleados: "todos",
  setEstadoEmpleados: (v: string) => { },
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [createType, setCreateType] = useState<string | null>(null);

  const [estadoEmpleados, setEstadoEmpleados] = useState<string>("todos");

  return (
    <DashboardContext.Provider
      value={{
        openCreate: (t) => setCreateType(t),
        estadoEmpleados,
        setEstadoEmpleados,
      }}
    >
      <div className="flex h-screen bg-gray-50 overflow-y-auto">

        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div
          className="flex-1 flex flex-col transition-all duration-300 min-w-0 min-w-0"
          style={{ marginLeft: collapsed ? "5rem" : "18rem" }}
        >
          <Navbar
            onOpenCreate={(t) => setCreateType(t)}
          />

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white border rounded-lg shadow-sm h-full flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4">
                {children}
              </div>
            </div>
          </main>
        </div>

        {createType && (
          <CreateModal type={createType} onClose={() => setCreateType(null)} />
        )}
      </div>
    </DashboardContext.Provider>
  );
}



