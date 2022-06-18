import { pluginKey } from "src/constants"
import { ParsedPluginConfig } from "src/server/plugin/Config"
import { createTestPluginConfig } from "test/utils"
import { describe, it, vi } from "vitest"

vi.mock("verdaccio/package.json")

describe("Config", () => {
  describe("validate config", () => {
    const enabledPluginConfig = { enabled: true } as any
    const pluginConfig = createTestPluginConfig()

    function createConfig(config: any) {
      new ParsedPluginConfig(config)
    }

    it("accepts an empty 'auth' node as long as it is enabled", () => {
      createConfig({
        auth: { [pluginKey]: enabledPluginConfig },
        middlewares: { [pluginKey]: pluginConfig },
      })
    })

    it("accepts an empty 'middlewares' node as long as it is enabled", () => {
      createConfig({
        auth: { [pluginKey]: pluginConfig },
        middlewares: { [pluginKey]: enabledPluginConfig },
      })
    })

    it("treats 'enterprise-origin' as optional", () => {
      createConfig({
        auth: {
          [pluginKey]: { ...pluginConfig, "enterprise-origin": undefined },
        },
        middlewares: {
          [pluginKey]: enabledPluginConfig,
        },
      })
    })

    it.fails("throws an error if the major version is below 5", () => {
      require("verdaccio/package.json").version = "4.3.2"
      createConfig({
        auth: { [pluginKey]: pluginConfig },
        middlewares: { [pluginKey]: enabledPluginConfig },
      })
    })

    it.fails("throws an error if 'auth' node is not enabled", () => {
      createConfig({
        middlewares: { [pluginKey]: pluginConfig },
      })
    })

    it.fails("throws an error if 'middlewares' node is not enabled", () => {
      createConfig({
        auth: { [pluginKey]: pluginConfig },
      })
    })

    it.fails("throws an error if 'client-id' is missing", () => {
      createConfig({
        auth: {
          [pluginKey]: { ...pluginConfig, ["client-id"]: undefined },
        },
        middlewares: {
          [pluginKey]: { enabled: true },
        },
      })
    })

    it.fails("throws an error if 'client-secret' is missing", () => {
      createConfig({
        auth: {
          [pluginKey]: { ...pluginConfig, ["client-secret"]: undefined },
        },
        middlewares: {
          [pluginKey]: { enabled: true },
        },
      })
    })

    it.fails("throws an error if 'token' is missing", () => {
      createConfig({
        auth: {
          [pluginKey]: { ...pluginConfig, ["token"]: undefined },
        },
        middlewares: {
          [pluginKey]: { enabled: true },
        },
      })
    })
  })
})
