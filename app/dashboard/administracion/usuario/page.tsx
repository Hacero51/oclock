'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input.JSX";
import { Users, UserPlus, Save, Edit, Trash2, Search, Eye, EyeOff, RefreshCw, Shield, Key, UserCheck } from "lucide-react";

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
  if (passwordEncriptado.length === 32 && /^[a-fA-F0-9]{32}$/.test(passwordEncriptado)) {
    return '********';
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

  // Cargar usuarios desde la API
  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const usuariosAPI: UsuarioAPI[] = await response.json();
      
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
      
      await cargarUsuarios();
      
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
    setUsuarioEditando({
      ...usuario,
      StoredPassword: '',
      confirmarStoredPassword: ''
    });
    setMostrarModal(true);
  };

  const handleGuardarEdicion = async () => {
    if (!usuarioEditando) return;

    if (!usuarioEditando.HiddenUserName.trim()) {
      alert('El nombre completo es requerido');
      return;
    }
    if (!usuarioEditando.UserName.trim()) {
      alert('El nombre de usuario es requerido');
      return;
    }

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
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
        <UserCheck className="h-3 w-3" />
        Activo
      </span> :
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit">
        <Shield className="h-3 w-3" />
        Inactivo
      </span>;
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

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-600 mt-1">
              Crear y administrar usuarios del sistema
            </p>
          </div>
        </div>

        <Button
          onClick={resetForm}
          className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Formulario
        </Button>
      </div>

      {/* Formulario de Creación */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Crear Nuevo Usuario
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo *
                  </label>
                  <Input
                    type="text"
                    name="HiddenUserName"
                    value={formData.HiddenUserName}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese el nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de Usuario *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleChange}
                      required
                      placeholder="Nombre de usuario"
                    />
                    <Button
                      type="button"
                      onClick={generarUsername}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Generar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Seguridad */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                Información de Seguridad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={mostrarPassword ? "text" : "password"}
                        name="StoredPassword"
                        value={formData.StoredPassword}
                        onChange={handleChange}
                        required
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      variant="outline"
                    >
                      {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      onClick={generarPassword}
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmar Contraseña *
                  </label>
                  <Input
                    type={mostrarPassword ? "text" : "password"}
                    name="confirmarStoredPassword"
                    value={formData.confirmarStoredPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repetir contraseña"
                  />
                </div>
              </div>
            </div>

            {/* Estado del Usuario */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                name="IsActive"
                checked={formData.IsActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Usuario activo</span>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {enviando ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {enviando ? 'Creando Usuario...' : 'Crear Usuario'}
              </Button>
              
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="flex-1"
              >
                Limpiar Formulario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Usuarios del Sistema
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Button
                onClick={cargarUsuarios}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {cargandoUsuarios ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-500">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500">
                {busqueda ? 'Intenta con otros términos de búsqueda' : 'Crea el primer usuario usando el formulario superior'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                          <Button
                            onClick={() => handleEditarUsuario(usuario)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleEliminarUsuario(usuario.Oid)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      {mostrarModal && usuarioEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4 border-b border-gray-200 bg-white">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Editar Usuario
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo *
                  </label>
                  <Input
                    type="text"
                    value={usuarioEditando.HiddenUserName}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, HiddenUserName: e.target.value} : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de Usuario *
                  </label>
                  <Input
                    type="text"
                    value={usuarioEditando.UserName}
                    onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, UserName: e.target.value} : null)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={usuarioEditando.IsActive}
                  onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, IsActive: e.target.checked} : null)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Usuario activo</span>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Cambiar Contraseña
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Deje en blanco para mantener la contraseña actual
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nueva Contraseña
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type={mostrarPassword ? "text" : "password"}
                        value={usuarioEditando.StoredPassword}
                        onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, StoredPassword: e.target.value} : null)}
                        placeholder="Nueva contraseña (mín. 6 caracteres)"
                      />
                      <Button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        variant="outline"
                      >
                        {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Confirmar Contraseña
                    </label>
                    <Input
                      type={mostrarPassword ? "text" : "password"}
                      value={usuarioEditando.confirmarStoredPassword}
                      onChange={(e) => setUsuarioEditando(prev => prev ? {...prev, confirmarStoredPassword: e.target.value} : null)}
                      placeholder="Confirmar nueva contraseña"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleGuardarEdicion}
                  disabled={enviando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {enviando ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {enviando ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  onClick={() => setMostrarModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}