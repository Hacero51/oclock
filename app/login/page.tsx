"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();



async function handleLogin(e: any) {
  e.preventDefault();

  const res = await signIn("credentials", {
    redirect: false,
    username,
    password,
  });

  console.log("Respuesta de signIn:", res);

  if (!res?.error) {
    router.push("/dashboard");
  } else {
    alert("Usuario o contraseña incorrectos");
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1229] text-gray-900">
      <div className="w-full max-w-md px-8 py-10 bg-[#CD0404] rounded-2xl shadow-xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="p-1 rounded-lg shadow-sm">
            <Image src="/logo.png" alt="Logo" width={90} height={90} className="rounded" />
          </div>
          <h1 className="text-2xl font-semibold text-center text-white">En Punto.</h1>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Bienvenido</h2>
          <p className="text-sm text-white/80">Inicia sesión para continuar</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-yellow-200 bg-black/20 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Acceso
          </button>
        </form>

        <p className="text-xs text-center text-white/70 mt-6">
          © 2025 En Punto. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}



