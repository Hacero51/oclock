// lib/rate-limit.ts

type RateLimitEntry = {
  count: number;
  lastAttempt: number;
  blockedUntil: number | null;
};

const store = new Map<string, RateLimitEntry>();

/**
 * Verifica si una clave (IP o Usuario) ha superado el límite de intentos.
 * @param key Identificador único (ej: IP del cliente)
 * @param limit Máximo de intentos permitidos
 * @param windowMs Ventana de tiempo en milisegundos (ej: 1 minuto)
 * @param blockDurationMs Duración del bloqueo en milisegundos (ej: 15 minutos)
 * @returns { isBlocked: boolean, remainingAttempts: number, blockedUntil: number | null }
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000,
  blockDurationMs: number = 900000
) {
  const now = Date.now();
  let entry = store.get(key);

  // Si no existe, crear entrada
  if (!entry) {
    entry = { count: 0, lastAttempt: now, blockedUntil: null };
    store.set(key, entry);
  }

  // Verificar si está bloqueado actualmente
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { isBlocked: true, remainingAttempts: 0, blockedUntil: entry.blockedUntil };
  }

  // Reiniciar contador si la ventana de tiempo ya pasó
  if (now - entry.lastAttempt > windowMs) {
    entry.count = 0;
    entry.blockedUntil = null;
  }

  entry.count++;
  entry.lastAttempt = now;

  // Si supera el límite, bloquear
  if (entry.count > limit) {
    entry.blockedUntil = now + blockDurationMs;
    return { isBlocked: true, remainingAttempts: 0, blockedUntil: entry.blockedUntil };
  }

  return { 
    isBlocked: false, 
    remainingAttempts: Math.max(0, limit - entry.count), 
    blockedUntil: null 
  };
}
