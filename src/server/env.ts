// A published install usually has no .env. Node throws on that; ignore only that case.
export function loadLocalEnv() {
  try {
    process.loadEnvFile()
  } catch (error) {
    if (isEnoent(error)) return
    throw error
  }
}

function isEnoent(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  )
}
