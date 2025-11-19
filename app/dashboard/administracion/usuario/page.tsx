'use client';

import React, { useState, useEffect } from 'react';

interface UsuarioForm {
  id?: string;
  nombre: string;
  apellido: string;
  username: string;
  password: string;
  confirmarPassword: string;
  rol: string;
  departamento: string;
  estado: boolean;
  fechaCreacion?: string;
}

interface Usuario extends UsuarioForm {
  id: string;
  fechaCreacion: string;
}

export default function CrearUsuario() {
  const [formData, setFormData] = useState<UsuarioForm>({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    confirmarPassword: '',
    rol: 'usuario',
    departamento: '',
    estado: true,
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'usuario', label: 'Usuario Estándar' },
    { value: 'visor', label: 'Solo Lectura' }
  ];

  const departamentos = [
    'Recursos Humanos',
    'Gerencia',
    'Sistemas',
    'Produccion'
  ];

  const permisosDisponibles = [
    'crear_usuarios',
    'editar_usuarios',
    'eliminar_usuarios',
    'ver_reportes',
    'exportar_datos',
    'configurar_sistema',
    'gestionar_marcaciones',
    'aprobar_permisos'
  ];

  // Cargar usuarios de ejemplo
  useEffect(() => {
    const usuariosEjemplo: Usuario[] = [
      {
        id: '1',
        nombre: 'Ana',
        apellido: 'García',
        username: 'agarcia',
        password: '********',
        confirmarPassword: '********',
        rol: 'admin',
        departamento: 'Recursos Humanos',
        estado: true,
        fechaCreacion: '2024-01-15'
      },
      {
        id: '2',
        nombre: 'Carlos',
        apellido: 'López',
        username: 'clopez',
        password: '********',
        confirmarPassword: '********',
        rol: 'usuario',
        departamento: 'Contabilidad',
        estado: true,
        fechaCreacion: '2024-02-20'
      },
      {
        id: '3',
        nombre: 'María',
        apellido: 'Rodríguez',
        username: 'mrodriguez',
        password: '********',
        confirmarPassword: '********',
        rol: 'visor',
        departamento: 'Gerencia',
        estado: false,
        fechaCreacion: '2024-03-10'
      }
    ];
    setUsuarios(usuariosEjemplo);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    // Validaciones
    if (formData.password !== formData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      setEnviando(false);
      return;
    }

    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      setEnviando(false);
      return;
    }

    try {
      // Simular envío a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nuevoUsuario: Usuario = {
        ...formData,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split('T')[0]
      };

      setUsuarios(prev => [nuevoUsuario, ...prev]);
      
      console.log('Usuario creado:', nuevoUsuario);
      alert('✅ Usuario creado exitosamente');
      
      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        username: '',
        password: '',
        confirmarPassword: '',
        rol: 'usuario',
        departamento: '',
        estado: true,
      });
      
    } catch (error) {
      alert('❌ Error al crear el usuario');
    } finally {
      setEnviando(false);
    }
  };

  const generarUsername = () => {
    if (formData.nombre && formData.apellido) {
      const username = `${formData.nombre.toLowerCase().charAt(0)}${formData.apellido.toLowerCase().replace(/\s+/g, '')}`;
      setFormData(prev => ({ ...prev, username }));
    }
  };

  const generarPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password, confirmarPassword: password }));
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setMostrarModal(true);
  };

  const handleGuardarEdicion = async () => {
    if (!usuarioEditando) return;

    setEnviando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsuarios(prev => 
        prev.map(user => 
          user.id === usuarioEditando.id ? usuarioEditando : user
        )
      );
      
      setMostrarModal(false);
      setUsuarioEditando(null);
      alert('✅ Usuario actualizado exitosamente');
    } catch (error) {
      alert('❌ Error al actualizar el usuario');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarUsuario = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsuarios(prev => prev.filter(user => user.id !== id));
      alert('✅ Usuario eliminado exitosamente');
    }
  };

  const getEstadoBadge = (estado: boolean) => {
    return estado ? 
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Activo</span> :
      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Inactivo</span>;
  };

  const getRolBadge = (rol: string) => {
    const colores = {
      superadmin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      usuario: 'bg-green-100 text-green-800',
      visor: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colores[rol as keyof typeof colores]}`}>
        {roles.find(r => r.value === rol)?.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">👤 Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Crear y administrar usuarios del sistema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">📝 Crear Nuevo Usuario</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese el apellido"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roles.map(rol => (
                      <option key={rol.value} value={rol.value}>
                        {rol.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar departamento</option>
                    {departamentos.map(depto => (
                      <option key={depto} value={depto}>
                        {depto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="bg-green-50 p-4 md:p-6 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-800 mb-4">🔐 Información de Cuenta</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Usuario *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre de usuario"
                    />
                    <button
                      type="button"
                      onClick={generarUsername}
                      className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="flex items-center space-x-3 p-3">
                    <input
                      type="checkbox"
                      name="estado"
                      checked={formData.estado}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Usuario activo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={mostrarPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      {mostrarPassword ? '🙈' : '👁️'}
                    </button>
                    <button
                      type="button"
                      onClick={generarPassword}
                      className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Repetir contraseña"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción del Formulario */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {enviando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando Usuario...
                  </>
                ) : (
                  '👤 Crear Usuario'
                )}
              </button>
              
              <button
                type="button"
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Usuarios Existentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">📋 Usuarios del Sistema</h2>
              <p className="text-gray-600 mt-1 text-sm">
                {usuarios.length} usuario(s) registrado(s)
              </p>
            </div>
          </div>

          {/* Tabla de Usuarios - Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                    Usuario
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                    Rol
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                    Departamento
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                    Fecha Creación
                  </th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr 
                    key={usuario.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleEditarUsuario(usuario)}
                  >
                    <td className="border border-gray-200 p-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="text-sm text-gray-500">@{usuario.username}</div>
                      </div>
                    </td>
                    <td className="border border-gray-200 p-3">
                      {getRolBadge(usuario.rol)}
                    </td>
                    <td className="border border-gray-200 p-3 text-sm text-gray-700">
                      {usuario.departamento}
                    </td>
                    <td className="border border-gray-200 p-3">
                      {getEstadoBadge(usuario.estado)}
                    </td>
                    <td className="border border-gray-200 p-3 text-sm text-gray-600">
                      {usuario.fechaCreacion}
                    </td>
                    <td className="border border-gray-200 p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarUsuario(usuario);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarUsuario(usuario.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista de Usuarios - Mobile */}
          <div className="lg:hidden space-y-4">
            {usuarios.map((usuario) => (
              <div 
                key={usuario.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleEditarUsuario(usuario)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {usuario.nombre} {usuario.apellido}
                    </h3>
                    <p className="text-sm text-gray-500">@{usuario.username}</p>
                  </div>
                  <div className="flex gap-2">
                    {getEstadoBadge(usuario.estado)}
                    {getRolBadge(usuario.rol)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="text-gray-900">{usuario.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Departamento:</span>
                    <div className="text-gray-900">{usuario.departamento}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Creado:</span>
                    <div className="text-gray-900">{usuario.fechaCreacion}</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarUsuario(usuario);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarUsuario(usuario.id);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {mostrarModal && usuarioEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">✏️ Editar Usuario</h2>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={usuarioEditando.nombre}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, nombre: e.target.value} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={usuarioEditando.apellido}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, apellido: e.target.value} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={usuarioEditando.email}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={usuarioEditando.rol}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, rol: e.target.value} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {roles.map(rol => (
                      <option key={rol.value} value={rol.value}>
                        {rol.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    value={usuarioEditando.departamento}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, departamento: e.target.value} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar departamento</option>
                    {departamentos.map(depto => (
                      <option key={depto} value={depto}>
                        {depto}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={usuarioEditando.estado}
                      onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, estado: e.target.checked} : null)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Usuario activo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleGuardarEdicion}
                  disabled={enviando}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
                >
                  {enviando ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}