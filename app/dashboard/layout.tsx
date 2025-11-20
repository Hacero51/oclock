"use client";

import { createContext, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import CreateModal from "@/components/CreateModal";

export const DashboardContext = createContext({
  openCreate: (type: string) => {},
});

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [createType, setCreateType] = useState<string | null>(null);

  return (
      <DashboardContext.Provider value={{ openCreate: (t) => setCreateType(t) }}>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          <div
            className="flex-1 flex flex-col transition-all duration-300"
            style={{ marginLeft: collapsed ? "5rem" : "18rem" }}
          >
            <Navbar
              collapsed={collapsed}
              onToggleSidebar={() => setCollapsed(!collapsed)}
              onOpenCreate={(t) => setCreateType(t)}
            />

            <main className="flex-1 p-6 overflow-visible">
              <div className="bg-white border rounded shadow-sm h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                  {children}
                </div>
                {/* Los controles de paginación se agregarán en cada página */}
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



