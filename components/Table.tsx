import React, { useState, useMemo } from "react";
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent } from "@/components/ui/context-menu";

interface TablaProps {
    columnas: any[];
    datos: any[];
    className?: string;
    onRowClick?: (fila: any) => void;
    onRowRightClick?: (fila: any) => void;
    selectedRowId?: string | null;
    renderContextMenu?: (fila: any) => React.ReactNode;
}

export default function Tabla({ columnas, datos, onRowClick, onRowRightClick, selectedRowId, renderContextMenu }: TablaProps) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            // Si ya está ordenado por esta columna, cambiar dirección
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Nueva columna, ordenar ascendente por defecto
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortColumn) return datos;

        return [...datos].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            // Manejar valores nulos/undefined
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            // Intentar comparación numérica primero
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // Comparación de strings
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();

            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr);
            } else {
                return bStr.localeCompare(aStr);
            }
        });
    }, [datos, sortColumn, sortDirection]);

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3.5 w-3.5 text-white" />
            : <ArrowDown className="h-3.5 w-3.5 text-white" />;
    };

    return (
        <div className="w-full">
            {/* Tabla Desktop - DISEÑO PREMIUM UNIFICADO */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                {columnas.map((col) => (
                                    <th
                                        key={col}
                                        onClick={() => handleSort(col)}
                                        className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{col}</span>
                                            {getSortIcon(col)}
                                        </div>
                                    </th>
                                ))}
                                {onRowClick && <th className="px-4 py-3 w-10"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedData.length > 0 ? (
                                sortedData.map((fila, i) => {
                                    const rowContent = (
                                        <tr
                                            key={i}
                                            className={`group cursor-pointer transition-all duration-150 ${selectedRowId && selectedRowId === fila.id ? "bg-indigo-50/50 border-l-4 border-indigo-600" : "hover:bg-gray-50"}`}
                                            onClick={() => onRowClick && onRowClick(fila)}
                                        >
                                            {columnas.map((col) => (
                                                <td
                                                    key={col}
                                                    className="px-4 py-2.5 text-[11px] text-gray-600 font-medium whitespace-nowrap"
                                                >
                                                    {fila[col] || "-"}
                                                </td>
                                            ))}
                                            {onRowClick && (
                                                <td className="px-4 py-2.5 text-gray-300 group-hover:text-indigo-500 transition-colors text-right">
                                                    <ChevronRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                                                </td>
                                            )}
                                        </tr>
                                    );

                                    if (renderContextMenu) {
                                        return (
                                            <ContextMenu key={i} onOpenChange={(open) => {
                                                if (open) {
                                                    if (onRowRightClick) onRowRightClick(fila);
                                                    else if (onRowClick) onRowClick(fila);
                                                }
                                            }}>
                                                <ContextMenuTrigger asChild>
                                                    {rowContent}
                                                </ContextMenuTrigger>
                                                <ContextMenuContent className="w-64 shadow-xl border-gray-200">
                                                    {renderContextMenu(fila)}
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        );
                                    }

                                    return rowContent;
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columnas.length + (onRowClick ? 1 : 0)}
                                        className="px-6 py-16 text-center text-gray-400 italic text-xs"
                                    >
                                        No hay datos disponibles en esta vista
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Mobile - MEJOR ESPACIADO */}
            <div className="md:hidden space-y-3">
                {sortedData.length > 0 ? (
                    sortedData.map((fila, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 active:scale-[0.99] cursor-pointer relative overflow-hidden group"
                            onClick={() => onRowClick && onRowClick(fila)}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="space-y-2">
                                {columnas.map((col) => (
                                    <div
                                        key={col}
                                        className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
                                    >
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate pr-2">
                                            {col}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 text-right truncate max-w-[60%]">
                                            {fila[col] || "-"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {onRowClick && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 opacity-50 group-hover:text-indigo-500 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                        No hay datos disponibles
                    </div>
                )}
            </div>
        </div>
    );
}
