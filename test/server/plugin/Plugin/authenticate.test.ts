import { GitHubAuthProvider } from "src/server/github/AuthProvider"
import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestAuthProvider,
  createTestPlugin,
  testOAuthToken,
  testUsername,
} from "test/utils"

jest.mock("src/server/github/AuthProvider")

const AuthProvider: GitHubAuthProvider & jest.MockInstance<any, any> =
  GitHubAuthProvider as any

describe("Plugin", () => {
  describe("authenticate", () => {
    let plugin: Plugin

    beforeEach(() => {
      AuthProvider.mockImplementation(() => createTestAuthProvider())
      plugin = createTestPlugin()
    })

    it("user with empty username cannot authenticate", (done) => {
      plugin.authenticate("", testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
        done()
      })
    })

    it("user with empty token cannot authenticate", (done) => {
      plugin.authenticate(testUsername, "", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
        done()
      })
    })

    it("user with invalid token throws error", (done) => {
      plugin.authenticate(testUsername, "invalid_token", (err, groups) => {
        expect(err).toBeTruthy()
        expect(groups).toBeFalsy()
        done()
      })
    })

    it("user with valid token can authenticate", (done) => {
      plugin.authenticate(testUsername, testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBeTruthy()
        done()
      })
    })
  })
})
