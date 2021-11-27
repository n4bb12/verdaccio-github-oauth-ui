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

    it("user with invalid token cannot authenticate", (done) => {
      plugin.authenticate(testUsername, "invalid token", (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual(false)
        done()
      })
    })

    it("user with valid token can authenticate", (done) => {
      plugin.authenticate(testUsername, testOAuthToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toMatchInlineSnapshot(`
          Array [
            "test-username",
            "github/TEST_ORG",
            "github/TEST_ORG/TEST_LEGACY_TEAM",
            "github/TEST_ORG/team/TEST_TEAM",
            "github/TEST_ORG/repo/TEST_REPO",
          ]
        `)
        done()
      })
    })
  })
})
