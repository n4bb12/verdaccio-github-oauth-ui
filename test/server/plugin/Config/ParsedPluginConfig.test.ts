import { pluginName } from "src/constants"
import {
  Config,
  ParsedPluginConfig,
  PluginConfig,
} from "src/server/plugin/Config"

describe("Config", () => {
  describe("ParsedPluginConfig", () => {
    const enabledPluginConfig = { enabled: true } as any

    const fooPluginConfig: PluginConfig = {
      "client-id": "clientId",
      "client-secret": "clientSecret",
      org: "FOO_ORG",
    }

    const barPluginConfig: PluginConfig = {
      "client-id": "clientId",
      "client-secret": "clientSecret",
      org: "BAR_ORG",
    }

    const minimalPluginConfig: PluginConfig = {
      "client-id": "clientId",
      "client-secret": "clientSecret",
      org: false,
    }

    const fooConfig: Config = {
      middlewares: { [pluginName]: enabledPluginConfig },
      auth: { [pluginName]: fooPluginConfig },
    } as any

    const barConfig: Config = {
      middlewares: { [pluginName]: barPluginConfig },
      auth: { [pluginName]: enabledPluginConfig },
    } as any

    const minimalConfig: Config = {
      middlewares: { [pluginName]: enabledPluginConfig },
      auth: { [pluginName]: minimalPluginConfig },
    } as any

    it("from auth", () => {
      const pluginConfig = new ParsedPluginConfig(fooConfig)
      expect(pluginConfig.org).toBe("FOO_ORG")
    })

    it("from middlewares", () => {
      const pluginConfig = new ParsedPluginConfig(barConfig)
      expect(pluginConfig.org).toBe("BAR_ORG")
    })

    it("from auth as environment variable", () => {
      process.env.FOO_ORG = "foo-org"
      const pluginConfig = new ParsedPluginConfig(fooConfig)
      expect(pluginConfig.org).toBe("foo-org")
    })

    it("from middlewares as environment variable", () => {
      process.env.BAR_ORG = "bar-org"
      const pluginConfig = new ParsedPluginConfig(barConfig)
      expect(pluginConfig.org).toBe("bar-org")
    })

    it("parses boolean environment variables", () => {
      process.env.BAR_ORG = "false"
      const pluginConfig = new ParsedPluginConfig(barConfig)
      expect(pluginConfig.org).toBe(false)
    })

    it("uses the documented defaults", () => {
      const pluginConfig = new ParsedPluginConfig(minimalConfig)
      expect(pluginConfig).toMatchInlineSnapshot(`
        ParsedPluginConfig {
          "clientId": "clientId",
          "clientSecret": "clientSecret",
          "config": Object {
            "auth": Object {
              "github-oauth-ui": Object {
                "client-id": "clientId",
                "client-secret": "clientSecret",
                "org": false,
              },
            },
            "middlewares": Object {
              "github-oauth-ui": Object {
                "enabled": true,
              },
            },
          },
          "enterpriseOrigin": false,
          "org": false,
          "packages": Object {},
          "repositoryAccess": true,
          "url_prefix": "",
        }
      `)
    })
  })
})
