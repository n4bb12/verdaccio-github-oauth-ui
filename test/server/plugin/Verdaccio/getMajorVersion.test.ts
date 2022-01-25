import { createTestVerdaccio } from "test/utils"

describe("Verdaccio", () => {
  describe("getMajorVersion", () => {
    it("correctly parses the user agent", () => {
      expect(createTestVerdaccio().majorVersion).toBe(5)
    })
  })
})
