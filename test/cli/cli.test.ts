import { getUsageInfo, printUsage } from "src/cli/usage"
import { describe, expect, it } from "vitest"

describe("CLI", () => {
  describe("usage", () => {
    it("usage info matches the snapshot", () => {
      expect(getUsageInfo()).toMatchInlineSnapshot(`
        [
          "It seems you are using the default npm registry.",
          "Please update it to your Verdaccio URL by either running:",
          "",
          "npm config set registry <URL>",
          "",
          "or by using the registry argument",
          "",
          "npx verdaccio-google-oauth-ui --registry <URL>",
        ]
      `)
    })

    it("does not throw an error", () => {
      printUsage()
    })
  })
})
