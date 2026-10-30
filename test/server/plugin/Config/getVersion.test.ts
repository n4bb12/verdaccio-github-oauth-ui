import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { getVersion, readVerdaccioVersion } from "src/server/plugin/Config"
import { afterEach, describe, expect, it } from "vitest"

describe("Verdaccio", () => {
  describe("getVersion", () => {
    const tempDirs: string[] = []

    afterEach(() => {
      for (const dir of tempDirs.splice(0)) {
        fs.rmSync(dir, { recursive: true, force: true })
      }
    })

    it("reads the installed verdaccio version from disk", () => {
      const installed = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "node_modules/verdaccio/package.json"),
          "utf8",
        ),
      ).version

      expect(getVersion()).toBe(installed)
    })

    it("walks up from a nested entry to the verdaccio manifest", () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), "verdaccio-version-"))
      tempDirs.push(root)
      const nested = path.join(root, "node_modules", "other", "build")
      fs.mkdirSync(nested, { recursive: true })
      fs.writeFileSync(
        path.join(root, "package.json"),
        JSON.stringify({ name: "verdaccio", version: "7.0.2" }),
      )
      fs.writeFileSync(
        path.join(root, "node_modules", "other", "package.json"),
        JSON.stringify({ name: "other", version: "1.0.0" }),
      )
      fs.writeFileSync(path.join(nested, "index.cjs"), "")

      expect(readVerdaccioVersion(path.join(nested, "index.cjs"))).toBe("7.0.2")
    })
  })
})
