import { pluginName } from "src/constants"
import { validateConfig, PluginConfig } from "src/server/plugin/Config"
import { createTestPluginConfig } from "test/utils"
import { join } from 'path';

describe("Config", () => {
  describe("validateConfig", () => {
    function shouldSucceed(config: any) {
      validateConfig(config)
    }

    it("accepts an empty 'auth' node as long as it is enabled", () => {
      shouldSucceed({
        auth: {
          [pluginName]: { enabled: true },
        },
        middlewares: {
          [pluginName]: createTestPluginConfig(),
        },
      })
    })

    it("accepts an empty 'middlewares' node as long as it is enabled", () => {
      shouldSucceed({
        auth: {
          [pluginName]: createTestPluginConfig(),
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("treats 'enterprise-origin' and 'enterprise-origin-file' as optional", () => {
      shouldSucceed({
        auth: {
          [pluginName]: {
            ...createTestPluginConfig(),
            ["enterprise-origin"]: null,
            ["enterprise-origin-file"]: null,
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("loads the values from file when the '-file' suffix is used on config properties", () => {
      shouldSucceed({
        auth: {
          [pluginName]: {
            ["org-file'"]: join(__dirname, 'files', 'enterprise-origin'),
            ["client-id-file"]: join(__dirname, 'files', 'client-id'),
            ["client-secret-file"]: join(__dirname, 'files', 'client-secret'),
            ["enterprise-origin-file"]: join(__dirname, 'files', 'enterprise-origin'),
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("overrides the config property from file when the '-file' suffix is used", () => {
      const config: any = {
        auth: {
          [pluginName]: {
            ...createTestPluginConfig(),
            ["org-file"]: join(__dirname, 'files', 'enterprise-origin'),
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      };
      const originalValue = config.auth[pluginName].org;
      shouldSucceed(config);
      const newValue = config.auth[pluginName].org;
      expect(newValue).not.toEqual(originalValue);
    })

    function shouldFail(config: any) {
      try {
        validateConfig(config)
        fail()
      } catch (error) {
        // expected
      }
    }

    it("throws an error if 'auth' node is not enabled", () => {
      shouldFail({
        middlewares: {
          [pluginName]: createTestPluginConfig(),
        },
      })
    })

    it("throws an error if 'middlewares' node is not enabled", () => {
      shouldFail({
        auth: {
          [pluginName]: createTestPluginConfig(),
        },
      })
    })

    it("throws an error if 'org' and 'org-file' are missing", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...createTestPluginConfig(), ["org"]: null, ["org-file"]: null },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("throws an error if 'client-id' and 'client-id-file' are  missing", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...createTestPluginConfig(), ["client-id"]: null, ["client-id-file"]: null },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("throws an error if 'client-secret' and 'client-secret-file' are missing ", () => {
      shouldFail({
        auth: {
          [pluginName]: {
            ...createTestPluginConfig(),
            ["client-secret"]: null,
            ["client-secret-file"]: null,
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("throws an error if an invalid file path is provided", () => {
      shouldFail({
        auth: {
          [pluginName]: { ...createTestPluginConfig(), ["client-id"]: null, ["client-id-file"]: join(__dirname, 'files', 'client-id2') },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })
  })
})
