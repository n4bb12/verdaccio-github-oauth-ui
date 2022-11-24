import { GitHubAuthProvider } from "src/server/github/AuthProvider"
import { createTestParsedPluginConfig } from "test/utils"
import { describe, expect, it } from "vitest"

describe("GitHubAuthProvider", () => {
  describe("getLoginUrl", () => {
    it("Public GitHub", () => {
      const config = createTestParsedPluginConfig()
      const provider = new GitHubAuthProvider(config)
      const loginUrl = provider.getLoginUrl("callbackUrl")

      expect(loginUrl).toMatchInlineSnapshot(
        '"https://github.com/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=callbackUrl"',
      )
    })

    it("GitHub Enterprise", () => {
      const config = createTestParsedPluginConfig({
        "enterprise-origin": "https://example.github.com",
      })

      const provider = new GitHubAuthProvider(config)
      const loginUrl = provider.getLoginUrl("callbackUrl")

      expect(loginUrl).toMatchInlineSnapshot(
        '"https://example.github.com/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=callbackUrl"',
      )
    })
  })
})
