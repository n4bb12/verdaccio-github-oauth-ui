import { getVersion } from "src/server/plugin/Config"
import { describe, expect, it } from "vitest"

describe("Verdaccio", () => {
  describe("getMajorVersion", () => {
    it("correctly parses the user agent", () => {
      expect(getVersion()[0]).toBe("5")
    })
  })
})
