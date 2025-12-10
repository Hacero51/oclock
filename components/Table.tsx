import React from "react";
import { ChevronRight } from "lucide-react";

interface TablaProps {
    columnas: string[];
    datos: Record<string, any>[];
    onRowClick?: (fila: Record<string, any>) => void;
}

export default function Tabla({ columnas, datos, onRowClick }: TablaProps) {
    return (
        <div className="w-full">
            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-y-auto rounded-2xl border border-gray-200 shadow-sm bg-white ring-1 ring-gray-100">
                <table className="w-full text-sm text-left">
                    <thead className="bg-blue-500 border-b border-white-900">
                        <tr>
                            {columnas.map((col) => (
                                <th
                                    key={col}
                                    className="px-6 py-4 text-xs font-semibold text-white-500 uppercase tracking-wider"
                                >
                                    {col}
                                </th>
                            ))}
                            {onRowClick && <th className="px-6 py-4 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
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
                                            className="px-6 py-4 text-gray-600 font-medium group-hover:text-gray-900 transition-colors"
                                        >
                                            {fila[col]}
                                        </td>
                                    ))}
                                    {onRowClick && (
                                        <td className="px-6 py-4 text-gray-400 group-hover:text-indigo-500 transition-colors text-right">
                                            <ChevronRight className="h-5 w-5 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columnas.length + (onRowClick ? 1 : 0)}
                                    className="px-6 py-12 text-center text-gray-400 italic"
                                >
                                    No hay datos para mostrar
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Vista Mobile */}
            <div className="md:hidden space-y-4">
                {datos.length > 0 ? (
                    datos.map((fila, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 active:scale-[0.99] cursor-pointer relative overflow-hidden group"
                            onClick={() => onRowClick && onRowClick(fila)}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="space-y-3">
                                {columnas.map((col) => (
                                    <div
                                        key={col}
                                        className="flex justify-between items-start border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                                    >
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                                            {col}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                                            {fila[col]}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {onRowClick && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-50 group-hover:text-indigo-500 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="h-5 w-5" />
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
