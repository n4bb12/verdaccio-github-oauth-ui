import { GitHubAuthProvider } from "src/server/github/AuthProvider"
import { ParsedPluginConfig } from "src/server/plugin/Config"
import { describe, expect, it } from "vitest"

describe("GitHubAuthProvider", () => {
  describe("getLoginUrl", () => {
    it("initiates OAuth flow with the correct scopes", () => {
      function shouldIncludeRepoScope(repositoryAccess: boolean) {
        const config: Partial<ParsedPluginConfig> = { repositoryAccess }
        const provider = new GitHubAuthProvider(config as ParsedPluginConfig)
        const loginUrl = provider.getLoginUrl("callbackUrl")
        const orgAndRepoScope = "&scope=" + encodeURIComponent("read:org,repo")
        const orgScope = "&scope=" + encodeURIComponent("read:org")

        if (repositoryAccess) {
          expect(loginUrl).toContain(orgAndRepoScope)
        } else {
          expect(loginUrl).not.toContain("repo")
          expect(loginUrl).toContain(orgScope)
        }
      }

      shouldIncludeRepoScope(true)
      shouldIncludeRepoScope(false)
    })
  })
})
