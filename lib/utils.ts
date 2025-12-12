import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidName(name: string): boolean {
  // Solo letras (mayúsculas/minúsculas), espacios y acentos.
  // Prohíbe números y símbolos especiales.
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
}

export function isAdult(birthDateString: string | Date): boolean {
  if (!birthDateString) return false;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
}