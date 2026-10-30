import { pluginKey } from "src/constants"
import {
  assertSupportedVerdaccioVersion,
  ParsedPluginConfig,
} from "src/server/plugin/Config"
import { createTestPluginConfig } from "test/utils"
import { describe, expect, it, vi } from "vitest"

describe("Config", () => {
  describe("validate config", () => {
    const enabledPluginConfig = { enabled: true } as any
    const pluginConfig = createTestPluginConfig()

    function createConfig(config: any) {
      new ParsedPluginConfig(config)
    }

    function expectConfigExit(config: any) {
      const exit = vi.spyOn(process, "exit").mockImplementation(((
        code?: number,
      ) => {
        throw new Error(`exit ${code}`)
      }) as typeof process.exit)

      try {
        expect(() => createConfig(config)).toThrow("exit 1")
      } finally {
        exit.mockRestore()
      }
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

    it("throws an error if the major version is below 5", () => {
      expect(() => assertSupportedVerdaccioVersion("4.3.2")).toThrow(
        "This plugin requires verdaccio 5 or above",
      )
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

    it("exits if 'client-id' is missing", () => {
      expectConfigExit({
        auth: {
          [pluginKey]: { ...pluginConfig, ["client-id"]: undefined },
        },
        middlewares: {
          [pluginKey]: { enabled: true },
        },
      })
    })

    it("exits if 'client-secret' is missing", () => {
      expectConfigExit({
        auth: {
          [pluginKey]: { ...pluginConfig, ["client-secret"]: undefined },
        },
        middlewares: {
          [pluginKey]: { enabled: true },
        },
      })
    })

    it("exits if 'token' is missing", () => {
      expectConfigExit({
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
