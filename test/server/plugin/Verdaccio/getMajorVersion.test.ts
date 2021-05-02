import { createTestVerdaccio } from "test/utils"

describe("Verdaccio", () => {
  describe("getMajorVersion", () => {
    function withConfig(config: any) {
      return createTestVerdaccio(config).majorVersion
    }

    it("correctly parses the user agent", () => {
      expect(withConfig({ user_agent: "verdaccio/5.0.4" })).toBe(5)
    })
  })
})
