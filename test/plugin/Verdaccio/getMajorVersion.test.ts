import { createTestVerdaccio } from "../test-utils"

describe("Verdaccio", () => {
  describe("getMajorVersion", () => {

    function withConfig(config: any) {
      return createTestVerdaccio(config).majorVersion
    }

    it("correctly parses the user agent", () => {
      expect(withConfig({ user_agent: "verdaccio/3.13.1" })).toBe(3)
      expect(withConfig({ user_agent: "verdaccio/4.3.4" })).toBe(4)
    })

  })

})
