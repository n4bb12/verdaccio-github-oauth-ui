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
        '"https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&client_id=CLIENT_ID&hd=&prompt=&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20openid&response_type=code&redirect_uri=callbackUrl"',
      )
    })
  })
})
