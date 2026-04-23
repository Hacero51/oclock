"use client";

import { createContext, useState, ReactNode, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import CreateModal from "@/components/CreateModal";

export const DashboardContext = createContext({
  openCreate: (type: string) => { },
  estadoEmpleados: "todos",
  setEstadoEmpleados: (v: string) => { },
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [createType, setCreateType] = useState<string | null>(null);

  const [estadoEmpleados, setEstadoEmpleados] = useState<string>("todos");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const contextValue = useMemo(() => ({
    openCreate: (t: string) => setCreateType(t),
    estadoEmpleados,
    setEstadoEmpleados,
    refreshTrigger,
    triggerRefresh,
  }), [estadoEmpleados, refreshTrigger]);

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="flex h-screen bg-gray-50 overflow-y-auto">

        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ml-20 ${collapsed ? "md:ml-20" : "md:ml-72"}`}
        >
          <Navbar
            onOpenCreate={(t: any) => setCreateType(t)}
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



