import { pluginName } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"

export function createTestConfig() {
  return {
    "org": "TEST_ORG",
    "client-id": "TEST_CLIENT_ID",
    "client-secret": "TEST_CLIENT_SECRET",
  }
}

export function createTestPlugin() {
  return new Plugin({
    auth: {
      [pluginName]: createTestConfig(),
    },
    middlewares: {
      [pluginName]: {
        enabled: true,
      },
    },
  } as any)
}
