'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Calendar, Users, Shield, ChevronLeft, ChevronRight } from "lucide-react";

interface ConceptoAsistencia {
  id?: string;
  codigo: string;
  codigoExportar: string;
  nombre: string;
  estado: string;
  factor: string;
}

interface TipoPermiso {
  id?: string;
  codigo: string;
  codigoExportar: string;
  nombre: string;
  pago: boolean;
  estado: string;
}

// Componente de controles de paginación mejorado
function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  tableType
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  tableType: 'asistencia' | 'permiso';
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          No hay {tableType === 'asistencia' ? 'conceptos de asistencia' : 'tipos de permisos'} para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Mostrando {startItem}-{endItem} de {totalItems} {tableType === 'asistencia' ? 'conceptos' : 'permisos'}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1 mx-2">
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
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 text-sm rounded-lg transition-all duration-200 ${currentPage === pageNum
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && <span className="text-gray-400 mx-1">...</span>}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// 🔧 CONFIGURACIÓN API - URLs que se conectarán a la base de datos
const API_URLS = {
  CONCEPTOS_ASISTENCIA: '/api/conceptos-asistencia',
  TIPOS_PERMISOS: '/api/tipos-permisos',
};

export default function GestionConceptos() {
  const [conceptosAsistencia, setConceptosAsistencia] = useState<ConceptoAsistencia[]>([]);
  const [tiposPermisos, setTiposPermisos] = useState<TipoPermiso[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para paginación de asistencia
  const [currentPageAsistencia, setCurrentPageAsistencia] = useState(1);
  const [itemsPerPageAsistencia] = useState(10);

  // Estados para paginación de permisos
  const [currentPagePermisos, setCurrentPagePermisos] = useState(1);
  const [itemsPerPagePermisos] = useState(5);

  // Estados para modal
  const [selectedConcepto, setSelectedConcepto] = useState<any>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [modalType, setModalType] = useState<'asistencia' | 'permiso'>('asistencia');

  // 📡 FUNCIONES API - Listas para conectar con la base de datos
  const fetchConceptosAsistencia = async (): Promise<ConceptoAsistencia[]> => {
    try {
      const response = await fetch(API_URLS.CONCEPTOS_ASISTENCIA);
      if (!response.ok) throw new Error('Error al cargar conceptos de asistencia');
      return await response.json();
    } catch (error) {
      console.error('Error fetching conceptos asistencia:', error);
      // Datos de ejemplo como fallback
      return [
        { id: '2', codigo: '01', codigoExportar: 'A01', nombre: '01.HORA ORDINARIA DIURNA', estado: 'Activo', factor: '1' },
        { id: '3', codigo: '02', codigoExportar: 'A49', nombre: '02.RECARGO NOCTURNO', estado: 'Activo', factor: '1.35' },
        { id: '4', codigo: '03.1', codigoExportar: 'R48', nombre: '03.DESCUENTOS EN TIEMPO LABORADO', estado: 'Activo', factor: '1' },
        { id: '5', codigo: '03', codigoExportar: 'A02', nombre: '03.HORAS EXTRAS ORDINARIAS DIURNAS', estado: 'Activo', factor: '1.25' },
        { id: '6', codigo: '04', codigoExportar: 'A04', nombre: '04.HORAS EXTRAS ORDINARIAS NOCTURNAS', estado: 'Activo', factor: '1.75' },
        { id: '7', codigo: '04.1', codigoExportar: 'A36', nombre: '04.BONIFICACION', estado: 'Activo', factor: '0' },
        { id: '10', codigo: '06', codigoExportar: 'A50', nombre: '06.HORA FESTIVA NOCTURNA', estado: 'Activo', factor: '2.10' },
        { id: '11', codigo: '07', codigoExportar: 'A06', nombre: '07.HORAS EXTRAS FESTIVAS DIURNAS', estado: 'Activo', factor: '2.00' },
        { id: '12', codigo: '08', codigoExportar: 'A08', nombre: '08.HORAS EXTRAS FESTIVAS NOCTURNAS', estado: 'Activo', factor: '2.50' },
      ];
    }
  };

  const fetchTiposPermisos = async (): Promise<TipoPermiso[]> => {
    try {
      const response = await fetch(API_URLS.TIPOS_PERMISOS);
      if (!response.ok) throw new Error('Error al cargar tipos de permisos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tipos permisos:', error);
      // Datos de ejemplo como fallback
      return [
        { id: '1', codigo: '001', codigoExportar: '', nombre: 'CITA MEDICA ARL', pago: true, estado: 'Activo' },
        { id: '2', codigo: '002', codigoExportar: '', nombre: 'CITA MEDICA GENERAL', pago: true, estado: 'Activo' },
        { id: '3', codigo: '003', codigoExportar: '', nombre: 'CITA MEDICA HIJOS MENOR DE 12 AÑOS', pago: true, estado: 'Activo' },
        { id: '4', codigo: '004', codigoExportar: '', nombre: 'DESCANSO POR DOBLAR TURNO', pago: true, estado: 'Activo' },
        { id: '5', codigo: '005', codigoExportar: 'A13', nombre: 'INCAPACIDAD ARL', pago: true, estado: 'Activo' },
        { id: '6', codigo: '006', codigoExportar: 'A12', nombre: 'INCAPACIDAD ENFERMEDAD GENERAL <=3 (66.67%)', pago: true, estado: 'Activo' },
        { id: '7', codigo: '007', codigoExportar: 'A09', nombre: 'INCAPACIDAD ENFERMEDAD GENERAL >3 (66.67%)', pago: true, estado: 'Activo' },
        { id: '8', codigo: '008', codigoExportar: '', nombre: 'INCAPACIDAD GENERAL HIJOS', pago: true, estado: 'Activo' },
        { id: '9', codigo: '009', codigoExportar: 'A28', nombre: 'INCAPACIDAD MATERNIDAD / PATERNIDAD', pago: true, estado: 'Activo' },
        { id: '10', codigo: '010', codigoExportar: '', nombre: 'PERMISO PERSONAL', pago: true, estado: 'Activo' },
        { id: '11', codigo: '011', codigoExportar: '', nombre: 'PERMISO POR DUELO', pago: true, estado: 'Activo' },
        { id: '12', codigo: '012', codigoExportar: '', nombre: 'SANCION', pago: true, estado: 'Activo' },
        { id: '13', codigo: '013', codigoExportar: '', nombre: 'VACACIONES', pago: true, estado: 'Activo' },
      ];
    }
  };

  // 📥 CARGAR DATOS AL INICIAR
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [asistenciaData, permisosData] = await Promise.all([
          fetchConceptosAsistencia(),
          fetchTiposPermisos()
        ]);

        setConceptosAsistencia(asistenciaData);
        setTiposPermisos(permisosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 📄 PAGINACIÓN PARA ASISTENCIA
  const conceptosAsistenciaPaginados = useMemo(() => {
    const startIndex = (currentPageAsistencia - 1) * itemsPerPageAsistencia;
    return conceptosAsistencia.slice(startIndex, startIndex + itemsPerPageAsistencia);
  }, [conceptosAsistencia, currentPageAsistencia, itemsPerPageAsistencia]);

  // 📄 PAGINACIÓN PARA PERMISOS
  const tiposPermisosPaginados = useMemo(() => {
    const startIndex = (currentPagePermisos - 1) * itemsPerPagePermisos;
    return tiposPermisos.slice(startIndex, startIndex + itemsPerPagePermisos);
  }, [tiposPermisos, currentPagePermisos, itemsPerPagePermisos]);

  const totalPagesAsistencia = Math.ceil(conceptosAsistencia.length / itemsPerPageAsistencia);
  const totalPagesPermisos = Math.ceil(tiposPermisos.length / itemsPerPagePermisos);

  // 🎯 PREPARAR DATOS PARA LAS TABLAS
  const datosParaTablaAsistencia = conceptosAsistenciaPaginados.map(concepto => ({
    'Código': concepto.codigo,
    'Código Exportar': concepto.codigoExportar || '-',
    'Nombre': concepto.nombre,
    'Factor': concepto.factor,
    'Estado': (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${concepto.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {concepto.estado}
      </span>
    )
  }));

  const datosParaTablaPermisos = tiposPermisosPaginados.map(permiso => ({
    'Código': permiso.codigo,
    'Código Exportar': permiso.codigoExportar || '-',
    'Nombre': permiso.nombre,
    'Pago': (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${permiso.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {permiso.pago ? 'Con pago' : 'Sin pago'}
      </span>
    ),
    'Estado': (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${permiso.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {permiso.estado}
      </span>
    )
  }));

  const columnasAsistencia = ['Código', 'Código Exportar', 'Nombre', 'Factor', 'Estado'];
  const columnasPermisos = ['Código', 'Código Exportar', 'Nombre', 'Pago', 'Estado'];

  // Función para manejar el click en una fila (abrir modal)
  const handleRowClickAsistencia = (fila: any) => {
    const conceptoOriginal = conceptosAsistenciaPaginados.find(
      concepto => concepto.codigo === fila['Código'] && concepto.nombre === fila['Nombre']
    );

    if (conceptoOriginal) {
      setSelectedConcepto(conceptoOriginal);
      setModalType('asistencia');
      setOpenUpdate(true);
    }
  };

  const handleRowClickPermisos = (fila: any) => {
    const permisoOriginal = tiposPermisosPaginados.find(
      permiso => permiso.codigo === fila['Código'] && permiso.nombre === fila['Nombre']
    );

    if (permisoOriginal) {
      setSelectedConcepto(permisoOriginal);
      setModalType('permiso');
      setOpenUpdate(true);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-500">Cargando conceptos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Conceptos</h1>
            <p className="text-sm text-gray-600 mt-1">
              Administra conceptos de asistencia y tipos de permisos
            </p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE LAS DOS TABLAS */}
      <div className="grid grid-cols-1 gap-6 w-full">

        {/* TABLA DE CONCEPTOS DE ASISTENCIA */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden min-w-0 w-full">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Conceptos de Asistencia
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 bg-white">
            {conceptosAsistencia.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Tabla
                    columnas={columnasAsistencia}
                    datos={datosParaTablaAsistencia}
                    onRowClick={handleRowClickAsistencia}
                  />
                </div>

                <PaginationControls
                  currentPage={currentPageAsistencia}
                  totalPages={totalPagesAsistencia}
                  totalItems={conceptosAsistencia.length}
                  itemsPerPage={itemsPerPageAsistencia}
                  onPageChange={setCurrentPageAsistencia}
                  tableType="asistencia"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay conceptos de asistencia</h3>
                <p className="text-gray-500">No se encontraron conceptos de asistencia en el sistema</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TABLA DE TIPOS DE PERMISOS */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden min-w-0 w-full">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Tipos de Permisos
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 bg-white">
            {tiposPermisos.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Tabla
                    columnas={columnasPermisos}
                    datos={datosParaTablaPermisos}
                    onRowClick={handleRowClickPermisos}
                  />
                </div>

                <PaginationControls
                  currentPage={currentPagePermisos}
                  totalPages={totalPagesPermisos}
                  totalItems={tiposPermisos.length}
                  itemsPerPage={itemsPerPagePermisos}
                  onPageChange={setCurrentPagePermisos}
                  tableType="permiso"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tipos de permisos</h3>
                <p className="text-gray-500">No se encontraron tipos de permisos en el sistema</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🔹 Update Modal */}
      {openUpdate && selectedConcepto && (
        <UpdateModal
          type={modalType === 'asistencia' ? 'conceptosasistencia' : 'tipopermiso'}
          data={selectedConcepto}
          onClose={() => setOpenUpdate(false)}
        />
      )}
    </div>
  );
}