/** Encodes success/failure as a value so data-access code never throws across a boundary. */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** Wraps a value as a successful Result. */
export function ok<T, E = never>(value: T): Result<T, E> {
  return { ok: true, value };
}

/** Wraps an error as a failed Result. */
export function err<E, T = never>(error: E): Result<T, E> {
  return { ok: false, error };
}
