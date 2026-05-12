"use client";

import { useState, useEffect } from "react";
import { ShieldUser, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import Tabla from "@/components/Table";
import { Pagination } from "@/components/ui/Pagination";

interface LogEntry {
    id: number;
    action: string;
    target: string;
    user: string;
    description: string;
    time: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage]);

    const fetchLogs = async (page: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/logs?page=${page}&limit=${itemsPerPage}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            console.error("Error cargando logs", error);
        } finally {
            setLoading(false);
        }
    };

    // Mapeamos a columnas de Tabla
    const columnas = ["ID", "Usuario", "Acción", "Objetivo", "Detalle", "Fecha"];
    const datosTabla = logs.map(l => ({
        "ID": l.id,
        "Usuario": l.user,
        "Acción": l.action,
        "Objetivo": l.target,
        "Detalle": l.description || "-",
        "Fecha": l.time ? new Date(l.time).toLocaleString() : "-"
    }));

    return (
        <div className="p-4 bg-gray-50/50 min-h-screen">
            <div className="max-w-[98%] mx-auto space-y-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <ShieldUser className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoría</h1>
                            <p className="text-sm text-gray-500">Historial de acciones administrativas (OClock Audit)</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar log..."
                            className="pl-9 h-10 bg-white"
                            disabled
                            title="Búsqueda próximamente"
                        />
                    </div>
                </div>

                {/* Contenido */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                            Cargando historial...
                        </div>
                    ) : (
                        <div className="flex flex-col min-h-[600px]">
                            <div className="flex-1 overflow-x-auto">
                                <Tabla
                                    columnas={columnas}
                                    datos={datosTabla}
                                />
                            </div>
                            <div className="border-t border-gray-100 bg-gray-50/50">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
