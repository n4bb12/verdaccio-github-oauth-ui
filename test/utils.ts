import { Request } from "express"

import { PluginConfig } from "../src/server/plugin/Config"
import { pluginName } from "src/constants"
import { AuthCore } from "src/server/plugin/AuthCore"
import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Config } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import { Verdaccio } from "src/server/verdaccio/Verdaccio"

export const testOrg = "github/TEST_ORG"
export const testTeam = "github/TEST_ORG/TEST_TEAM"
export const testGroups = [
  testOrg,
  "unrelated_org",
  testTeam,
  `${testOrg}/unrelated_team`,
]
export const testClientId = "TEST_CLIENT_ID"
export const testClientSecret = "TEST_CLIENT_SECRET"
export const testUsername = "test-username"
export const testProviderId = "test-auth-provider"
export const testLoginUrl = "test-login-url"
export const testOAuthCode = "test-code"
export const testOAuthToken = "test-token"
export const testMajorVersion = 4
export const testBaseUrl = "http://localhost:4873"
export const testUIToken = "test-ui-token"
export const testNPMToken = "test-npm-token"
export const testErrorMessage = "expected-error"

export function createTestPluginConfig(config?: Partial<PluginConfig>) {
  return {
    org: "TEST_ORG",
    "client-id": testClientId,
    "client-secret": testClientSecret,
    ...config,
  }
}

export function createTestConfig(config?: Partial<PluginConfig>) {
  return ({
    auth: {
      [pluginName]: createTestPluginConfig(),
    },
    middlewares: {
      [pluginName]: {
        enabled: true,
      },
    },
    user_agent: "verdaccio/5.0.4",
    ...config,
  } as any) as Config
}

export function createTestVerdaccio(config?: Partial<PluginConfig>) {
  const verdaccio = new Verdaccio(createTestConfig(config))
  verdaccio.issueUiToken = jest.fn(() => Promise.resolve(testUIToken))
  verdaccio.issueNpmToken = jest.fn(() => Promise.resolve(testNPMToken))
  return verdaccio
}

export function createTestAuthProvider() {
  const provider: AuthProvider = {
    getId() {
      return testProviderId
    },
    getLoginUrl() {
      return testLoginUrl
    },
    getCode(req: Request) {
      return testOAuthCode
    },
    async getToken(code: string) {
      return code === testOAuthCode ? testOAuthToken : ""
    },
    async getUsername(token: string) {
      return token === testOAuthToken ? testUsername : ""
    },
    async getGroups(token: string) {
      return token === testOAuthToken ? testGroups : []
    },
  }
  return provider
}

export function createTestAuthCore(config?: Partial<PluginConfig>) {
  return new AuthCore(createTestVerdaccio(config), createTestConfig(config))
}

export function createTestPlugin(config?: Partial<PluginConfig>) {
  return new Plugin(createTestConfig(config))
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
