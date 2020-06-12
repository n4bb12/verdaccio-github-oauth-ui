import { createTestVerdaccio, testBaseUrl } from "test/utils"

describe("Verdaccio", () => {
  describe("getBaseUrl", () => {
    function withConfig(config: any) {
      return createTestVerdaccio(config).baseUrl
    }

    it("returns an empty string by default", () => {
      expect(withConfig({})).toBe("")
      expect(withConfig({ url_prefix: null })).toBe("")
    })

    it("uses the configured 'url_prefix' without trailing slash", () => {
      expect(withConfig({ url_prefix: "/" })).toBe("")
      expect(withConfig({ url_prefix: "/verdaccio/" })).toBe("/verdaccio")
      expect(withConfig({ url_prefix: testBaseUrl })).toBe(testBaseUrl)
    })
  })
})
