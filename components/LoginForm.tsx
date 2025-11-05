"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    console.log("Datos del login:", data);
    // Aquí luego conectaremos con next-auth
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-gray-700 font-medium">Correo</label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="usuario@ejemplo.com"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-medium">Contraseña</label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="********"
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
