import fs from "node:fs"
import path from "node:path"
import { getVersion } from "src/server/plugin/Config"
import { describe, expect, it } from "bun:test"

describe("Verdaccio", () => {
  describe("getVersion", () => {
    it("reads the installed verdaccio version from disk", () => {
      const installed = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "node_modules/verdaccio/package.json"),
          "utf8",
        ),
      ).version

      expect(getVersion()).toBe(installed)
    })
  })
})
