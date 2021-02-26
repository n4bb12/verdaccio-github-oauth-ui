import { Request } from "express"
import { pluginName } from "src/constants"
import { AuthCore } from "src/server/plugin/AuthCore"
import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Config } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import { Verdaccio } from "src/server/verdaccio/Verdaccio"

export const testRequiredGroup = "TEST_ORG"
export const testRequiredTeam = "TEST_TEAM"
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

export function createTestPluginConfig(config?: any) {
  return {
    org: testRequiredGroup,
    team: testRequiredTeam,
    "client-id": testClientId,
    "client-secret": testClientSecret,
    ...config,
  }
}

export function createTestConfig(config?: any) {
  return ({
    auth: {
      [pluginName]: createTestPluginConfig(),
    },
    middlewares: {
      [pluginName]: {
        enabled: true,
      },
    },
    user_agent: "verdaccio/4.3.4",
    ...config,
  } as any) as Config
}

export function createTestVerdaccio(config?: any) {
  const verdaccio = new Verdaccio(createTestConfig(config))
  verdaccio.issueUiToken = jest.fn(() => Promise.resolve(testUIToken))
  verdaccio.issueNpmToken = jest.fn(() => Promise.resolve(testNPMToken))
  return verdaccio
}

export function createTestAuthProvider(config?: any) {
  const conf = createTestConfig(config)
  const provider: AuthProvider = {
    getId() {
      return testProviderId
    },
    getConf(){
      return conf
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
      return token === testOAuthToken ? [testRequiredGroup] : []
    },
    async getTeams(username: string, group: string, token: string) {
      return token === testOAuthToken ? [testRequiredTeam] : []
    }
  }
  return provider
}

export function createTestAuthCore(config?: any) {
  return new AuthCore(createTestVerdaccio(config), createTestConfig(config))
}

export function createTestPlugin(config?: any) {
  return new Plugin(createTestConfig(config))
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
