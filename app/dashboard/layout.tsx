"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import CreateModal from "@/components/CreateModal";

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Modal dinámico (empleado, cargo, etc)
  const [modalType, setModalType] = useState(null);

  const expandedWidthRem = 18;
  const collapsedWidthRem = 5;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenedor principal */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: `${collapsed ? collapsedWidthRem : expandedWidthRem}rem`,
        }}
      >
        {/* Navbar recibe un callback para abrir modales */}
        <Navbar
          {...({
            onToggleSidebar: () => setCollapsed(!collapsed),
            collapsed,
            onOpenCreate: (type: any) => setModalType(type),
          } as any)}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            {/* Le pasamos también el setModalType a los children */}
            {children &&
              typeof children === "object" &&
              // Clonamos el hijo para agregarle el prop de abrir modal
              Array.isArray(children)
                ? children.map((child) =>
                    child && typeof child === "object"
                      ? { ...child, props: { ...child.props, onOpenCreate: setModalType } }
                      : child
                  )
                : { ...children, props: { ...children.props, onOpenCreate: setModalType } }}
          </div>
        </main>
      </div>

      {/* Modal dinámico global */}
      {modalType && (
        <CreateModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
}



