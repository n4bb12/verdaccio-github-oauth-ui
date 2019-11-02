import { AuthCore } from "src/server/plugin/AuthCore"
import { Config, pluginName } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import { Verdaccio } from "src/server/verdaccio/Verdaccio"

jest.mock("src/server/verdaccio/Verdaccio")

// tslint:disable variable-name
const VerdaccioMock: Verdaccio & jest.MockInstance<any, any> = Verdaccio as any
// tslint:enable

export function createTestPluginConfig() {
  return {
    "org": "TEST_ORG",
    "client-id": "TEST_CLIENT_ID",
    "client-secret": "TEST_CLIENT_SECRET",
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
      majorVersion: 4,
      baseUrl: "http://localhost:4873",
      async issueNpmToken() {
        return "test-npm-token"
      },
      async issueUiToken() {
        return "test-ui-token"
      },
    }
  })
  return new Verdaccio(createTestVerdaccioConfig())
}

export function createTestAuthCore() {
  return new AuthCore(createTestVerdaccio(), createTestVerdaccioConfig())
}

export function createTestPlugin() {
  return new Plugin(createTestVerdaccioConfig())
}
