import { GoogleAuthProvider } from "src/server/google/AuthProvider"
import { createTestParsedPluginConfig } from "test/utils"
import { describe, expect, it } from "vitest"

describe("GoogleAuthProvider", () => {
  describe("getLoginUrl", () => {
    it("Public Google", () => {
      const config = createTestParsedPluginConfig()
      const provider = new GoogleAuthProvider(config)
      const loginUrl = provider.getLoginUrl("callbackUrl")

      expect(loginUrl).toMatchInlineSnapshot(
        '"https://github.com/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=callbackUrl"',
      )
    })
  })
})
