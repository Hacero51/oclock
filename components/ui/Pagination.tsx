import { ChevronLeft, ChevronRight, Users, FileText } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    label?: string;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    pageSizeOptions?: number[];
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    label = "elementos",
    pageSizeOptions = [8, 12, 24, 48]
}: PaginationProps) {

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems === 0) {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 sm:px-6 bg-white border-t border-gray-200">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    No hay {label} para mostrar
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-2 px-4 sm:px-6 bg-white border-t border-gray-200">
            {/* Información de resultados y selector de página */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400 hidden sm:block" />
                    <span className="text-xs sm:text-sm">
                        Mostrando <span className="text-gray-900 font-bold">{startItem}-{endItem}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> {label}
                    </span>
                </div>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Mostrar:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                onItemsPerPageChange(Number(e.target.value));
                                onPageChange(1); // Reset to page 1 when changing page size
                            }}
                            className="text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1 pl-2 pr-7 bg-white"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Navegación de páginas */}
            <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm bg-white"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-0.5 sm:gap-1 mx-1 sm:mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                type="button"
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center ${currentPage === pageNum
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-1 sm:ring-2 ring-indigo-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600 border border-transparent hover:border-gray-200 bg-white"
                                    }`}
                                aria-label={`Ir a página ${pageNum}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm bg-white"
                    aria-label="Página siguiente"
                >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
            </div>
        </div>
    );
}