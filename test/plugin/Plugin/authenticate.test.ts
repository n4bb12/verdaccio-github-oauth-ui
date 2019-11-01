import { GitHubAuthProvider } from "src/server/github/AuthProvider"
import { PluginConfig } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"

import { createTestConfig, createTestPlugin } from "../test-utils"

jest.mock("src/server/github/AuthProvider")

// tslint:disable-next-line: variable-name
const AuthProvider: GitHubAuthProvider & jest.MockInstance<any, any> = GitHubAuthProvider as any

describe("Plugin", () => {
  describe("authenticate", () => {

    const testUsername = "turtle"
    const testToken = "eltrut"

    let config: PluginConfig
    let plugin: Plugin

    beforeEach(() => {
      config = createTestConfig()
      AuthProvider.mockImplementation(() => {
        return {
          async getUsername(token: string) {
            return token === testToken ? testUsername : ""
          },
          async getGroups(token: string) {
            return token === testToken ? [config.org] : []
          },
        }
      })
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
      plugin.authenticate(testUsername, testToken, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual([config.org])
        done()
      })
    })

  })

})
