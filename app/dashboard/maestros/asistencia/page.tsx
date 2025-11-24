'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Tabla from "../../../../components/Table";
import UpdateModal from "@/components/UpdateModal";

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

// Componente de controles de paginación local
function PaginationControls({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  tableType 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0 && currentPage === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-white border-t border-gray-200">
        <div className="text-xs text-gray-600">
          No hay {tableType === 'asistencia' ? 'conceptos de asistencia' : 'tipos de permisos'} para mostrar
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border-t border-gray-200">
      <div className="text-xs text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} {tableType === 'asistencia' ? 'conceptos' : 'permisos'}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        <span className="text-xs text-gray-600 mx-1">
          Pág. {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
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
  const [itemsPerPageAsistencia] = useState(5);
  
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
        { id: '1', codigo: '00', codigoExportar: '', nombre: '00.TURNO', estado: 'Activo', factor: '0,' },
        { id: '2', codigo: '01', codigoExportar: '', nombre: '01.TIEMPO LABORADO', estado: 'Activo', factor: '0,' },
        { id: '3', codigo: '02', codigoExportar: 'A49', nombre: '02.RECARGO NOCTURNO', estado: 'Activo', factor: '1,35' },
        { id: '4', codigo: '03.1', codigoExportar: 'R48', nombre: '03.DESCUENTOS EN TIEMPO LABORADO', estado: 'Activo', factor: '1,' },
        { id: '5', codigo: '03', codigoExportar: 'A02', nombre: '03.HORAS EXTRAS ORDINARIAS DIURNAS', estado: 'Activo', factor: '1,25' },
        { id: '6', codigo: '04', codigoExportar: 'A04', nombre: '04.HORAS EXTRAS ORDINARIAS NOCTURNAS', estado: 'Activo', factor: '1,75' },
        { id: '7', codigo: '08', codigoExportar: 'A46', nombre: '08.HORAS EXTRAS FESTIVAS DIURNAS', estado: 'Activo', factor: '2,' },
        { id: '8', codigo: '98', codigoExportar: '', nombre: '98.RETARDO', estado: 'Activo', factor: '0,' },
        { id: '9', codigo: '99', codigoExportar: '', nombre: '99.AUSENCIA', estado: 'Activo', factor: '0,' },
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
    'Fecha/Proga': concepto.factor,
    'Estado': (
      <span className={`px-2 py-1 rounded text-xs ${
        concepto.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
      <span className={`px-2 py-1 rounded text-xs ${
        permiso.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {permiso.pago ? 'Con pago' : 'Sin pago'}
      </span>
    ),
    'Estado': (
      <span className={`px-2 py-1 rounded text-xs ${
        permiso.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {permiso.estado}
      </span>
    )
  }));

  const columnasAsistencia = ['Código', 'Código Exportar', 'Nombre', 'Fecha/Proga', 'Estado'];
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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando conceptos...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Asistencia</h1>

      {/* CONTENEDOR DE LAS DOS TABLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TABLA DE CONCEPTOS DE ASISTENCIA */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Conceptos de Asistencia</h2>
          </div>
          
          {conceptosAsistencia.length > 0 ? (
            <>
              <div className="text-xs">
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
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay conceptos de asistencia para mostrar
            </div>
          )}
        </div>

        {/* TABLA DE TIPOS DE PERMISOS */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Tipos de Permisos</h2>
          </div>
          
          {tiposPermisos.length > 0 ? (
            <>
              <div className="text-xs">
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
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay tipos de permisos para mostrar
            </div>
          )}
        </div>
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
