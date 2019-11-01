import { getConfig, PluginConfig, pluginName } from "src/server/plugin/Config"

describe("Config", () => {
  describe("getConfig", () => {

    const authConfig: PluginConfig = {
      auth: {
        [pluginName]: { org: "TEST_ORG" },
      },
      middlewares: {
        [pluginName]: { enabled: true },
      },
    } as any

    const middlewaresConfig: PluginConfig = {
      auth: {
        [pluginName]: { enabled: true },
      },
      middlewares: {
        [pluginName]: { org: "TEST_ORG" },
      },
    } as any

    it("from auth", () => {
      const value = getConfig(authConfig, "org")
      expect(value).toBe("TEST_ORG")
    })

    it("from middlewares", () => {
      const value = getConfig(middlewaresConfig, "org")
      expect(value).toBe("TEST_ORG")
    })

    it("from auth as environment variable", () => {
      process.env.TEST_ORG = "test-org"
      const value = getConfig(authConfig, "org")
      expect(value).toBe("test-org")
    })

    it("from middlewares as environment variable", () => {
      process.env.TEST_ORG = "test-org"
      const value = getConfig(middlewaresConfig, "org")
      expect(value).toBe("test-org")
    })

    it("auth is preferred over middlewares", () => {
      process.env.TEST_ORG = "test-org"
      const value = getConfig(middlewaresConfig, "org")
      expect(value).toBe("test-org")
    })

  })
})
