import React from "react";
import { ChevronRight } from "lucide-react";

interface TablaProps {
    columnas: any[];
    datos: any[];
    className?: string;
    onRowClick?: (fila: any) => void;
}

export default function Tabla({ columnas, datos, onRowClick }: TablaProps) {
    return (
        <div className="w-full">
            {/* Tabla Desktop - CON MEJOR RESPONSIVE */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white ring-1 ring-gray-100">
                <div className="min-w-full">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-blue-500 border-b border-white-900">
                            <tr>
                                {columnas.map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-3 text-xs font-semibold text-white-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {col}
                                    </th>
                                ))}
                                {onRowClick && <th className="px-4 py-3 w-10"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-900">
                            {datos.length > 0 ? (
                                datos.map((fila, i) => (
                                    <tr
                                        key={i}
                                        className="group hover:bg-indigo-50/40 cursor-pointer transition-all duration-200"
                                        onClick={() => onRowClick && onRowClick(fila)}
                                    >
                                        {columnas.map((col) => (
                                            <td
                                                key={col}
                                                className="px-4 py-3 text-white-600 font-medium group-hover:text-gray-900 transition-colors whitespace-nowrap"
                                            >
                                                {fila[col] || "-"}
                                            </td>
                                        ))}
                                        {onRowClick && (
                                            <td className="px-4 py-3 text-gray-400 group-hover:text-indigo-500 transition-colors text-right">
                                                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columnas.length + (onRowClick ? 1 : 0)}
                                        className="px-6 py-12 text-center text-white-400 italic"
                                    >
                                        No hay datos para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Mobile - MEJOR ESPACIADO */}
            <div className="md:hidden space-y-3">
                {datos.length > 0 ? (
                    datos.map((fila, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 active:scale-[0.99] cursor-pointer relative overflow-hidden group"
                            onClick={() => onRowClick && onRowClick(fila)}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="space-y-2">
                                {columnas.slice(0, 3).map((col) => (
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

                                {/* Mostrar solo las primeras 3 columnas en móvil, el resto en tooltip o modal */}
                                {columnas.length > 3 && (
                                    <div className="pt-2 mt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 text-center">
                                            {columnas.length - 3} campos más...
                                        </p>
                                    </div>
                                )}
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