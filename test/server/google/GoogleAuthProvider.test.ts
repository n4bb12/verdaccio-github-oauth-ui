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
        '"https://accounts.google.com/o/oauth2/v2/auth?client_id=CLIENT_ID&redirect_uri=callbackUrl&scope=openid%20email%20profile&response_type=code&hd="',
      )
    })
  })
})
