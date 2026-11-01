import { beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("src/server/github/AuthProvider", () => ({
  GitHubAuthProvider: mock(function () {
    // Loaded lazily so this mock is in place before the plugin module evaluates.
    const { createTestAuthProvider } = require("../../../utils")
    return createTestAuthProvider()
  }),
}))

describe("Plugin", () => {
  describe("authenticate", () => {
    let plugin: {
      authenticate: (
        userName: string,
        userToken: string,
        callback: (err: unknown, groups: unknown) => void,
      ) => Promise<void>
    }

    beforeEach(() => {
      const { createTestPlugin } = require("../../../utils")
      plugin = createTestPlugin()
    })

    it("empty user name cannot authenticate", async () => {
      const { testOAuthToken } = require("../../../utils")
      await plugin.authenticate("", testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("empty token cannot authenticate", async () => {
      const { testUserName } = require("../../../utils")
      await plugin.authenticate(testUserName, "", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("invalid token cannot authenticate", async () => {
      const { testUserName } = require("../../../utils")
      await plugin.authenticate(testUserName, "invalidToken", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("valid user name and token can authenticate", async () => {
      const { testOAuthToken, testUserName } = require("../../../utils")
      await plugin.authenticate(testUserName, testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual([])
      })
    })
  })
})
