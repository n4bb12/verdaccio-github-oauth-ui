import { pluginName } from "src/constants"
import { Config, PluginConfig, validateConfig } from "src/server/plugin/Config"
import { createTestPluginConfig, testUserAgent } from "test/utils"

describe("Config", () => {
  describe("validateConfig", () => {
    const pluginConfig = createTestPluginConfig()
    const enabledPluginNode = { enabled: true } as any as PluginConfig

    function shouldSucceed(config: Config) {
      validateConfig(config)
    }

    it("accepts an empty 'auth' node as long as it is enabled", () => {
      shouldSucceed({
        auth: { [pluginName]: enabledPluginNode },
        middlewares: { [pluginName]: pluginConfig },
        user_agent: testUserAgent,
      })
    })

    it("accepts an empty 'middlewares' node as long as it is enabled", () => {
      shouldSucceed({
        auth: { [pluginName]: pluginConfig },
        middlewares: { [pluginName]: enabledPluginNode },
        user_agent: testUserAgent,
      })
    })

    it("treats 'enterprise-origin' as optional", () => {
      shouldSucceed({
        auth: {
          [pluginName]: { ...pluginConfig, "enterprise-origin": undefined },
        },
        middlewares: {
          [pluginName]: enabledPluginNode,
        },
        user_agent: testUserAgent,
      })
    })

    function shouldFail(config: any) {
      try {
        validateConfig(config)
        fail()
      } catch (error) {
        // expected
      }
    }

    it("throws an error if the major version is below 5", () => {
      shouldFail({
        auth: { [pluginName]: pluginConfig },
        middlewares: { [pluginName]: enabledPluginNode },
        user_agent: "verdaccio/4.3.2",
      })
    })

    it("throws an error if 'auth' node is not enabled", () => {
      shouldFail({
        middlewares: { [pluginName]: pluginConfig },
        user_agent: testUserAgent,
      })
    })

    it("throws an error if 'middlewares' node is not enabled", () => {
      shouldFail({
        auth: { [pluginName]: pluginConfig },
        user_agent: testUserAgent,
      })
    })

    it("throws an error if 'client-id' is missing", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...pluginConfig, ["client-id"]: undefined },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
        user_agent: testUserAgent,
      })
    })

    it("throws an error if 'client-secret' is missing", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...pluginConfig, ["client-secret"]: undefined },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
        user_agent: testUserAgent,
      })
    })

    it("throws an error if 'org' is missing", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...pluginConfig, ["org"]: undefined },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
        user_agent: testUserAgent,
      })
    })

    it("throws an error if 'org' is true", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...pluginConfig, ["org"]: true },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
        user_agent: testUserAgent,
      })
    })
  })
})
