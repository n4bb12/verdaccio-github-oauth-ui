import { createTestVerdaccio } from "test/utils"

describe("Verdaccio", () => {
  describe("getMajorVersion", () => {
    function withConfig(config: any) {
      return createTestVerdaccio(config).majorVersion
    }

    it("correctly parses the user agent", () => {
      expect(withConfig({ user_agent: "verdaccio/4.3.2" })).toBe(4)
      expect(withConfig({ user_agent: "verdaccio/5.4.3" })).toBe(5)
    })
  })
})
