export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export const success = <T>(data: T): Result<T> => ({ success: true, data })

export const failure = (error: string | Error): Result<never> => {
  const message = error instanceof Error ? error.message : error
  return { success: false, error: message }
}