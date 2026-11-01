import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Path of this compiled file when Node loads the CommonJS bundle.
 * Unit tests load the TypeScript source as ESM, which has no `__filename`,
 * so they fall back to the module that called this helper.
 *
 * `eval` keeps the bundler from replacing `__filename` with the source path.
 */
export function runtimeFilename(): string {
  try {
    return eval("__filename") as string
  } catch {
    const frames = new Error().stack?.split("\n") ?? []
    for (const frame of frames) {
      if (frame.includes("runtime-path.ts")) continue
      const located =
        frame.match(/\((.*):\d+:\d+\)$/) ?? frame.match(/at (.*):\d+:\d+$/)
      const file = located?.[1]
      if (!file) continue
      if (file.startsWith("file://")) return fileURLToPath(file)
      if (file.startsWith("/")) return file
    }
    throw new Error("Unable to determine the current filename")
  }
}

export function runtimeDirname(): string {
  return dirname(runtimeFilename())
}
