import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestAuthProvider,
  createTestPlugin,
  testOAuthToken,
  testUserName,
} from "test/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("src/server/github/AuthProvider", () => ({
  GitHubAuthProvider: vi
    .fn()
    .mockImplementation(() => createTestAuthProvider()),
}))

describe("Plugin", () => {
  describe("authenticate", () => {
    let plugin: Plugin

    beforeEach(() => {
      plugin = createTestPlugin()
    })

    it("user with empty username cannot authenticate", async () => {
      await plugin.authenticate("", testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("user with empty token cannot authenticate", async () => {
      await plugin.authenticate(testUserName, "", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
      })
    })

    it("user with invalid token throws error", async () => {
      await plugin.authenticate(
        testUserName,
        "invalid_token",
        (err, groups) => {
          expect(err).toBeTruthy()
          expect(groups).toBeFalsy()
        },
      )
    })

    it("user with valid token can authenticate", async () => {
      await plugin.authenticate(testUserName, testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBeTruthy()
      })
    })
  })
})
