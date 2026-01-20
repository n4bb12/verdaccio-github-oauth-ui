import { afterEach } from "node:test"
import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestAuthProvider,
  createTestPlugin,
  testOAuthToken,
  testUserName,
} from "test/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("src/server/github/AuthProvider", () => ({
  GitHubAuthProvider: vi.fn().mockImplementation(function () {
    return createTestAuthProvider()
  }),
}))

describe("Plugin", () => {
  describe("authenticate", () => {
    let plugin: Plugin

    beforeEach(() => {
      plugin = createTestPlugin()
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it("empty user name cannot authenticate", async () => {
      await plugin.authenticate("", testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("empty token cannot authenticate", async () => {
      await plugin.authenticate(testUserName, "", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("invalid token cannot authenticate", async () => {
      await plugin.authenticate(testUserName, "invalidToken", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("valid user name and token can authenticate", async () => {
      await plugin.authenticate(testUserName, testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual([])
      })
    })
  })
})
