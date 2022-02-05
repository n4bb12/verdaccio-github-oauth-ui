import { pluginName } from "src/constants"
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
        auth: { [pluginName]: enabledPluginConfig },
        middlewares: { [pluginName]: pluginConfig },
      })
    })

    it("accepts an empty 'middlewares' node as long as it is enabled", () => {
      createConfig({
        auth: { [pluginName]: pluginConfig },
        middlewares: { [pluginName]: enabledPluginConfig },
      })
    })

    it("treats 'enterprise-origin' as optional", () => {
      createConfig({
        auth: {
          [pluginName]: { ...pluginConfig, "enterprise-origin": undefined },
        },
        middlewares: {
          [pluginName]: enabledPluginConfig,
        },
      })
    })

    it("treats 'repository-access' as optional", () => {
      createConfig({
        auth: {
          [pluginName]: { ...pluginConfig, "repository-access": undefined },
        },
        middlewares: {
          [pluginName]: enabledPluginConfig,
        },
      })
    })

    it.fails("throws an error if the major version is below 5", () => {
      require("verdaccio/package.json").version = "4.3.2"
      createConfig({
        auth: { [pluginName]: pluginConfig },
        middlewares: { [pluginName]: enabledPluginConfig },
      })
    })

    it.fails("throws an error if 'auth' node is not enabled", () => {
      createConfig({
        middlewares: { [pluginName]: pluginConfig },
      })
    })

    it.fails("throws an error if 'middlewares' node is not enabled", () => {
      createConfig({
        auth: { [pluginName]: pluginConfig },
      })
    })

    it.fails("throws an error if 'client-id' is missing", () => {
      createConfig({
        auth: {
          [pluginName]: { ...pluginConfig, ["client-id"]: undefined },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it.fails("throws an error if 'client-secret' is missing", () => {
      createConfig({
        auth: {
          [pluginName]: { ...pluginConfig, ["client-secret"]: undefined },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it.fails("throws an error if 'org' is missing", () => {
      createConfig({
        auth: {
          [pluginName]: { ...pluginConfig, ["org"]: undefined },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it.fails("throws an error if 'org' is true", () => {
      createConfig({
        auth: {
          [pluginName]: { ...pluginConfig, ["org"]: true },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })
  })
})
