import { createTestVerdaccio } from "test/utils"
import { describe, expect, it } from "vitest"

describe("Verdaccio", () => {
  describe("getMajorVersion", () => {
    it("correctly parses the user agent", () => {
      expect(createTestVerdaccio().majorVersion).toBe(5)
    })
  })
})
