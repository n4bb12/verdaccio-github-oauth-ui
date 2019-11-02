import { Request } from "express"
import { AuthCore } from "src/server/plugin/AuthCore"
import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Config, pluginName } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import { Verdaccio } from "src/server/verdaccio/Verdaccio"

jest.mock("src/server/verdaccio/Verdaccio")

// tslint:disable variable-name
const VerdaccioMock: Verdaccio & jest.MockInstance<any, any> = Verdaccio as any
// tslint:enable


export const authenticated = "$authenticated"
export const testRequiredGroup = "TEST_ORG"
export const testClientId = "TEST_CLIENT_ID"
export const testClientSecret = "TEST_CLIENT_SECRET"
export const testUsername = "test-username"
export const testOAuthToken = "test-token"
export const testMajorVersion = 4
export const testBaseUrl = "http://localhost:4873"
export const testUIToken = "test-ui-token"
export const testNPMToken = "test-npm-token"

export function createTestPluginConfig() {
  return {
    "org": testRequiredGroup,
    "client-id": testClientId,
    "client-secret": testClientSecret,
  }
}

export function createTestVerdaccioConfig() {
  return {
    auth: {
      [pluginName]: createTestPluginConfig(),
    },
    middlewares: {
      [pluginName]: {
        enabled: true,
      },
    },
  } as any as Config
}

export function createTestVerdaccio() {
  VerdaccioMock.mockImplementation(() => {
    return {
      majorVersion: testMajorVersion,
      baseUrl: testBaseUrl,
      async issueUiToken() {
        return testUIToken
      },
      async issueNpmToken() {
        return testNPMToken
      },
    }
  })
  return new Verdaccio(createTestVerdaccioConfig())
}

export function createTestAuthProvider() {
  const config = createTestPluginConfig()
  const provider: AuthProvider = {
    getId() {
      return "test"
    },
    getLoginUrl() {
      return "test-login-url"
    },
    getCode(req: Request) {
      return "test-code"
    },
    async getToken(code: string) {
      return testOAuthToken
    },
    async getUsername(token: string) {
      return testUsername
    },
    async getGroups(token: string) {
      return [config.org]
    },
  }
  return provider
}

export function createTestAuthCore() {
  return new AuthCore(createTestVerdaccio(), createTestVerdaccioConfig())
}

export function createTestPlugin() {
  return new Plugin(createTestVerdaccioConfig())
}
