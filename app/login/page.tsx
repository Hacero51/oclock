"use client";

import { useState } from "react";
import { Eye, EyeOff, User } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1229] text-gray-900">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-xl">
        {/* Icono superior */}
        <div className="flex flex-col items-center mb-6">
          <User className="w-10 h-10 text-blue-600 mb-3" />
          <h1 className="text-2xl font-semibold text-center text-gray-800">
            Portal de gestión de empleados
          </h1>
        </div>

        {/* Título de bienvenida */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bienvenido</h2>
          <p className="text-sm text-gray-500">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Acceso
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-6">
          © 2025 Oclock. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

