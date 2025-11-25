'use client';

import React, { useState, useEffect } from 'react';

interface UsuarioForm {
  Oid?: string;
  HiddenUserName: string;
  UserName: string;
  StoredPassword: string;
  confirmarStoredPassword: string;
  IsActive: boolean;
}

interface Usuario extends UsuarioForm {
  Oid: string;
}

interface UsuarioAPI {
  Oid: string;
  HiddenUserName: string | null;
  UserName: string | null;
  StoredPassword: string | null;
  IsActive: boolean | null;
}

// Función para simular desencriptación (MD5 no es reversible, así que mostramos placeholder)
const obtenerPasswordLegible = (passwordEncriptado: string | null): string => {
  if (!passwordEncriptado) return '';
  // Si la contraseña está encriptada (MD5 hash), mostramos un placeholder
  // En un caso real, no podrías desencriptar MD5, es solo para visualización
  if (passwordEncriptado.length === 32 && /^[a-fA-F0-9]{32}$/.test(passwordEncriptado)) {
    return '********'; // Placeholder para contraseñas encriptadas
  }
  return passwordEncriptado;
};

export default function CrearUsuario() {
  const [formData, setFormData] = useState<UsuarioForm>({
    HiddenUserName: '',
    UserName: '',
    StoredPassword: '',
    confirmarStoredPassword: '',
    IsActive: true,
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [rolesDisponibles, setRolesDisponibles] = useState<string[]>([]);

  // Cargar usuarios desde la API
  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const usuariosAPI: UsuarioAPI[] = await response.json();
      
      
      // Transformar datos de la API al formato del componente
      const usuariosTransformados: Usuario[] = usuariosAPI.map(usuario => ({
        Oid: usuario.Oid,
        HiddenUserName: usuario.HiddenUserName || '',
        UserName: usuario.UserName || '',
        StoredPassword: obtenerPasswordLegible(usuario.StoredPassword),
        confirmarStoredPassword: obtenerPasswordLegible(usuario.StoredPassword),
        IsActive: usuario.IsActive || false
      }));
      
      setUsuarios(usuariosTransformados);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar los usuarios');
    } finally {
      setCargandoUsuarios(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Filtrar usuarios basado en la búsqueda
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.HiddenUserName.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.UserName.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validarFormulario = (): string | null => {
    if (!formData.HiddenUserName.trim()) {
      return 'El nombre completo es requerido';
    }
    if (!formData.UserName.trim()) {
      return 'El nombre de usuario es requerido';
    }
    if (formData.StoredPassword.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.StoredPassword !== formData.confirmarStoredPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          HiddenUserName: formData.HiddenUserName,
          UserName: formData.UserName,
          StoredPassword: formData.StoredPassword,
          IsActive: formData.IsActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear usuario');
      }

      const usuarioCreado = await response.json();
      
      console.log('Usuario creado:', usuarioCreado);
      alert('✅ Usuario creado exitosamente');
      
      // Recargar la lista de usuarios
      await cargarUsuarios();
      
      // Resetear formulario
      setFormData({
        HiddenUserName: '',
        UserName: '',
        StoredPassword: '',
        confirmarStoredPassword: '',
        IsActive: true,
      });
      
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ Error al crear el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setEnviando(false);
    }
  };

  const generarUsername = () => {
    if (formData.HiddenUserName.trim().length > 0) {
      const partes = formData.HiddenUserName.toLowerCase().split(" ");
      const user = partes[0].charAt(0) + (partes[1] ? partes[1] : '');
      setFormData(prev => ({ ...prev, UserName: user }));
    }
  };

  const generarPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      StoredPassword: password,
      confirmarStoredPassword: password,
    }));
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    // Cuando editamos, mostramos la contraseña real si el usuario quiere cambiarla
    setUsuarioEditando({
      ...usuario,
      StoredPassword: '', // Vaciamos para forzar nueva contraseña o mantener la actual
      confirmarStoredPassword: ''
    });
    setMostrarModal(true);
  };

  const handleGuardarEdicion = async () => {
    if (!usuarioEditando) return;

    // Validaciones específicas para edición
    if (!usuarioEditando.HiddenUserName.trim()) {
      alert('El nombre completo es requerido');
      return;
    }
    if (!usuarioEditando.UserName.trim()) {
      alert('El nombre de usuario es requerido');
      return;
    }

    // Si el usuario ingresó una nueva contraseña, validarla
    if (usuarioEditando.StoredPassword && usuarioEditando.StoredPassword !== '********') {
      if (usuarioEditando.StoredPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (usuarioEditando.StoredPassword !== usuarioEditando.confirmarStoredPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
    }

    setEnviando(true);
    try {
      const datosEnvio: any = {
        Oid: usuarioEditando.Oid,
        HiddenUserName: usuarioEditando.HiddenUserName,
        UserName: usuarioEditando.UserName,
        IsActive: usuarioEditando.IsActive,
      };

      // Solo enviar la contraseña si el usuario la cambió
      if (usuarioEditando.StoredPassword && usuarioEditando.StoredPassword !== '********') {
        datosEnvio.StoredPassword = usuarioEditando.StoredPassword;
      }

      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosEnvio),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      await cargarUsuarios();
      setMostrarModal(false);
      setUsuarioEditando(null);
      alert('✅ Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ Error al actualizar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/usuarios?oid=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar usuario');
        }

        await cargarUsuarios();
        alert('✅ Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error al eliminar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const getEstadoBadge = (estado: boolean) => {
    return estado ? 
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Activo</span> :
      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Inactivo</span>;
  };


  const resetForm = () => {
    setFormData({
      HiddenUserName: '',
      UserName: '',
      StoredPassword: '',
      confirmarStoredPassword: '',
      IsActive: true,
    });
  };

  // Combinar roles disponibles con los predeterminados para asegurar opciones
  const todasLasOpcionesRol = [
    ...new Set([...rolesDisponibles, 'Administradores', 'Supervisor', 'Usuario'])
  ];

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
            <div className="mt-4 md:mt-0">
              <button
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                🆕 Nuevo Formulario
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">📝 Información Personal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="HiddenUserName"
                    value={formData.HiddenUserName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ingrese el nombre completo"
                  />
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
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleChange}
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nombre de usuario"
                    />
                    <button
                      type="button"
                      onClick={generarUsername}
                      className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                      title="Generar nombre de usuario"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-300">
                    <input
                      type="checkbox"
                      name="IsActive"
                      checked={formData.IsActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Usuario activo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={mostrarPassword ? "text" : "password"}
                      name="StoredPassword"
                      value={formData.StoredPassword}
                      onChange={handleChange}
                      required
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                      title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarPassword ? '🙈' : '👁️'}
                    </button>
                    <button
                      type="button"
                      onClick={generarPassword}
                      className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                      title="Generar contraseña segura"
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
                    name="confirmarStoredPassword"
                    value={formData.confirmarStoredPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm"
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
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-sm"
              >
                🔄 Limpiar
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
                {cargandoUsuarios ? 'Cargando...' : `${usuariosFiltrados.length} de ${usuarios.length} usuario(s)`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
              <button
                onClick={cargarUsuarios}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>

          {cargandoUsuarios ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
              <p className="text-gray-500 text-sm mt-2">
                {busqueda ? 'Intenta con otros términos de búsqueda' : 'Crea el primer usuario usando el formulario superior'}
              </p>
            </div>
          ) : (
            <>
              {/* Tabla de Usuarios - Desktop */}
              <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">
                        Usuario
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr 
                        key={usuario.Oid} 
                        className="hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {usuario.HiddenUserName}
                            </div>
                            <div className="text-sm text-gray-500">@{usuario.UserName}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getEstadoBadge(usuario.IsActive)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditarUsuario(usuario)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleEliminarUsuario(usuario.Oid)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
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
                {usuariosFiltrados.map((usuario) => (
                  <div 
                    key={usuario.Oid}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {usuario.HiddenUserName}
                        </h3>
                        <p className="text-sm text-gray-500">@{usuario.UserName}</p>
                      </div>
                      <div className="flex gap-2">
                        {getEstadoBadge(usuario.IsActive)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditarUsuario(usuario)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminarUsuario(usuario.Oid)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={usuarioEditando.HiddenUserName}
                      onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, HiddenUserName: e.target.value} : null)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      checked={usuarioEditando.IsActive}
                      onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, IsActive: e.target.checked} : null)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Usuario activo</span>
                  </label>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔐 Cambiar Contraseña</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Deje en blanco para mantener la contraseña actual
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={mostrarPassword ? "text" : "password"}
                          value={usuarioEditando.StoredPassword}
                          onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, StoredPassword: e.target.value} : null)}
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nueva contraseña (mín. 6 caracteres)"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                        >
                          {mostrarPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña
                      </label>
                      <input
                        type={mostrarPassword ? "text" : "password"}
                        value={usuarioEditando.confirmarStoredPassword}
                        onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, confirmarStoredPassword: e.target.value} : null)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Confirmar nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleGuardarEdicion}
                  disabled={enviando}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {enviando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    '💾 Guardar Cambios'
                  )}
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
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