'use client';

import React, { useState, useEffect } from 'react';
import Tabla from "../../../../components/Table";

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

interface ConceptoUnificado {
  id: string;
  codigo: string;
  codigoExportar: string;
  nombre: string;
  tipo: 'asistencia' | 'permiso';
  estado: string;
  factor?: string;
  pago?: boolean;
}

// 🔧 CONFIGURACIÓN API - URLs que se conectarán a la base de datos
const API_URLS = {
  CONCEPTOS_ASISTENCIA: '/api/conceptos-asistencia',
  TIPOS_PERMISOS: '/api/tipos-permisos',
};

export default function GestionConceptos() {
  const [conceptosAsistencia, setConceptosAsistencia] = useState<ConceptoAsistencia[]>([]);
  const [tiposPermisos, setTiposPermisos] = useState<TipoPermiso[]>([]);
  const [conceptosUnificados, setConceptosUnificados] = useState<ConceptoUnificado[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'asistencia' | 'permiso'>('todos');
  const [cargando, setCargando] = useState(true);

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
        unificarConceptos(asistenciaData, permisosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 🔄 UNIFICAR CONCEPTOS
  const unificarConceptos = (asistencia: ConceptoAsistencia[], permisos: TipoPermiso[]) => {
    const unificados: ConceptoUnificado[] = [
      ...asistencia.map(item => ({
        id: `asistencia-${item.id || item.codigo}`,
        codigo: item.codigo,
        codigoExportar: item.codigoExportar,
        nombre: item.nombre,
        tipo: 'asistencia' as const,
        estado: item.estado,
        factor: item.factor
      })),
      ...permisos.map(item => ({
        id: `permiso-${item.id || item.codigo}`,
        codigo: item.codigo,
        codigoExportar: item.codigoExportar,
        nombre: item.nombre,
        tipo: 'permiso' as const,
        estado: item.estado,
        pago: item.pago
      }))
    ];
    setConceptosUnificados(unificados);
  };

  // 🔍 FILTRAR CONCEPTOS
  const conceptosFiltrados = conceptosUnificados.filter(concepto => {
    const coincideBusqueda = concepto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                           concepto.codigo.includes(filtro) ||
                           concepto.codigoExportar.toLowerCase().includes(filtro.toLowerCase());
    const coincideTipo = filtroTipo === 'todos' || concepto.tipo === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  // 🎯 PREPARAR DATOS PARA LA TABLA ESTANDARIZADA - CORREGIDO
  const datos = conceptosFiltrados.map(concepto => ({
    // Las claves deben coincidir EXACTAMENTE con los nombres de las columnas
    'Código': concepto.codigo,
    'Código Exportar': concepto.codigoExportar || '-',
    'Nombre': concepto.nombre,
    'Factor/Pago': concepto.tipo === 'asistencia' 
      ? concepto.factor 
      : (
        <span className={`px-2 py-1 rounded text-xs ${
          concepto.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {concepto.pago ? 'Con pago' : 'Sin pago'}
        </span>
      ),
    'Estado': (
      <span className={`px-2 py-1 rounded text-xs ${
        concepto.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {concepto.estado}
      </span>
    )
  }));

  const columnas = ['Código', 'Código Exportar', 'Nombre', 'Factor/Pago', 'Estado'];

  // Función para manejar el click en una fila
  const handleRowClick = (fila: any) => {
    console.log('Fila clickeada:', fila);
    // Aquí puedes agregar lógica para editar, ver detalles, etc.
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando conceptos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Asistencia</h1>

      {/* CONTROLES SUPERIORES */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Buscar por código, nombre o código exportar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as any)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="todos">Todos</option>
          <option value="asistencia">Conceptos Asistencia</option>
          <option value="permiso">Tipos de Permisos</option>
        </select>
      </div>

      {/* TABLA ESTANDARIZADA */}
      {datos.length > 0 ? (
        <Tabla 
          columnas={columnas}
          datos={datos}
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No se encontraron conceptos con los filtros aplicados
        </div>
      )}
    </div>
  );
}