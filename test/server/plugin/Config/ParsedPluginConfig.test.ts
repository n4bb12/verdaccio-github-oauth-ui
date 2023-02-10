import { pluginKey } from "src/constants"
import {
  Config,
  ParsedPluginConfig,
  PluginConfig,
} from "src/server/plugin/Config"
import { describe, expect, it } from "vitest"

describe("ParsedPluginConfig", () => {
  const enabledPluginConfig = {
    enabled: true,
  } as any

  const minimalPluginConfig: PluginConfig = {
    "client-id": "clientId",
    "client-secret": "clientSecret",
  }
  it.fails("middlewares key is required", () => {
    const invalidConfig: Config = {
      auth: { [pluginKey]: enabledPluginConfig },
    } as any

    new ParsedPluginConfig(invalidConfig)
  })

  it.fails("auth key is required", () => {
    const invalidConfig: Config = {
      middlewares: { [pluginKey]: minimalPluginConfig },
    } as any

    new ParsedPluginConfig(invalidConfig)
  })

  it("accepts the minimal configuration and uses the documented defaults", () => {
    const config: Config = {
      middlewares: { [pluginKey]: enabledPluginConfig },
      auth: { [pluginKey]: minimalPluginConfig },
    } as any

    const parsedPluginConfig = new ParsedPluginConfig(config)

    // Don't snapshot constructor properties
    const { config: _, ...result } = parsedPluginConfig

    expect(result).toMatchInlineSnapshot(`
      {
        "clientId": "clientId",
        "clientSecret": "clientSecret",
        "domain": undefined,
        "groupsConfig": undefined,
        "prompt": undefined,
        "url_prefix": "",
      }
    `)
  })

  it("parses the configuration as expected", () => {
    const enabledPluginConfig = {
      enabled: true,
    } as any

    const minimalPluginConfig: PluginConfig = {
      "client-id": "clientId",
      "client-secret": "clientSecret",
      domain: "enterpriseOrigin",
    }

    const config: Config = {
      middlewares: { [pluginKey]: enabledPluginConfig },
      auth: { [pluginKey]: minimalPluginConfig },
      url_prefix: "/verdaccio/",
      packages: {
        // valid groups
        package1: { access: "$authenticated" },
        package2: { access: "verdaccio" },
        package3: { access: "verdaccio-publish" },
        package4: { access: "verdaccio-unpublish" },
      },
    } as any

    const parsedPluginConfig = new ParsedPluginConfig(config)

    // Don't snapshot constructor properties
    const { config: _, ...result } = parsedPluginConfig

    expect(result).toMatchInlineSnapshot(`
      {
        "clientId": "clientId",
        "clientSecret": "clientSecret",
        "domain": "enterpriseOrigin",
        "groupsConfig": undefined,
        "prompt": undefined,
        "url_prefix": "/verdaccio/",
      }
    `)
  })

  it("deduplicates package groups", () => {
    const enabledPluginConfig = {
      enabled: true,
    } as any

    const minimalPluginConfig: PluginConfig = {
      "client-id": "clientId",
      "client-secret": "clientSecret",
      domain: "enterpriseOrigin",
    }

    const config: Config = {
      middlewares: { [pluginKey]: enabledPluginConfig },
      auth: { [pluginKey]: minimalPluginConfig },
      url_prefix: "/verdaccio/",
      packages: {
        package1a: { access: "$authenticated" },
        package1b: { access: "$authenticated" },

        package2a: { access: "verdaccio" },
        package2b: { access: "verdaccio" },

        package3a: { access: "verdaccio-publish" },
        package3b: { access: "verdaccio-publish" },

        package4a: { access: "verdaccio-unpublish" },
        package4b: { access: "verdaccio-unpublish" },
      },
    } as any
  })
})
