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
    token: "token",
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

    expect(parsedPluginConfig).toMatchInlineSnapshot(`
      ParsedPluginConfig {
        "clientId": "clientId",
        "clientSecret": "clientSecret",
        "config": {
          "auth": {
            "github-oauth-ui": {
              "client-id": "clientId",
              "client-secret": "clientSecret",
              "token": "token",
            },
          },
          "middlewares": {
            "github-oauth-ui": {
              "enabled": true,
            },
          },
        },
        "configuredGroupsMap": {},
        "enterpriseOrigin": undefined,
        "parsedOrgs": [],
        "parsedRepos": [],
        "parsedTeams": [],
        "parsedUsers": [],
        "token": "token",
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
      token: "token",
      "enterprise-origin": "enterpriseOrigin",
    }

    const config: Config = {
      middlewares: { [pluginKey]: enabledPluginConfig },
      auth: { [pluginKey]: minimalPluginConfig },
      url_prefix: "/verdaccio/",
      packages: {
        // valid groups
        package1: { access: "$authenticated" },
        package2: { access: "github/user/TEST_USER" },
        package3: { access: "github/user/TEST_USER/repo/TEST_REPO" },
        package4: { access: "github/org/TEST_ORG" },
        package5: { access: "github/org/TEST_ORG/team/TEST_TEAM" },
        package6: { access: "github/org/TEST_ORG/repo/TEST_REPO" },

        // invalid groups
        invalidPackage1: { access: "$X" },

        invalidPackage2: { access: "X/user/TEST_USER" },
        invalidPackage3: { access: "X/user/TEST_USER/repo/TEST_REPO" },
        invalidPackage4: { access: "X/org/TEST_ORG" },
        invalidPackage5: { access: "X/org/TEST_ORG/team/TEST_TEAM" },
        invalidPackage6: { access: "X/org/TEST_ORG/repo/TEST_REPO" },

        invalidPackage7: { access: "github/X/TEST_USER" },
        invalidPackage8: { access: "github/X/TEST_USER/repo/TEST_REPO" },
        invalidPackage9: { access: "github/X/TEST_ORG" },
        invalidPackage10: { access: "github/X/TEST_ORG/team/TEST_TEAM" },
        invalidPackage11: { access: "github/X/TEST_ORG/repo/TEST_REPO" },

        invalidPackage12: { access: "github/user/TEST_USER/X/TEST_REPO" },
        invalidPackage13: { access: "github/org/TEST_ORG/X/TEST_TEAM" },
        invalidPackage14: { access: "github/org/TEST_ORG/X/TEST_REPO" },

        invalidPackage15: { access: "github/user/TEST_USER/X" },
        invalidPackage16: { access: "github/user/TEST_USER/repo/TEST_REPO/X" },
        invalidPackage17: { access: "github/org/TEST_ORG/X" },
        invalidPackage18: { access: "github/org/TEST_ORG/team/TEST_TEAM/X" },
        invalidPackage19: { access: "github/org/TEST_ORG/repo/TEST_REPO/X" },
      },
    } as any

    const parsedPluginConfig = new ParsedPluginConfig(config)

    // Don't snapshot constructor properties
    const { config: _, ...result } = parsedPluginConfig

    expect(result).toMatchInlineSnapshot(`
      {
        "clientId": "clientId",
        "clientSecret": "clientSecret",
        "configuredGroupsMap": {
          "github/org/TEST_ORG": true,
          "github/org/TEST_ORG/repo/TEST_REPO": true,
          "github/org/TEST_ORG/team/TEST_TEAM": true,
          "github/user/TEST_USER": true,
          "github/user/TEST_USER/repo/TEST_REPO": true,
        },
        "enterpriseOrigin": "enterpriseOrigin",
        "parsedOrgs": [
          {
            "group": "github/org/TEST_ORG",
            "org": "TEST_ORG",
          },
        ],
        "parsedRepos": [
          {
            "group": "github/user/TEST_USER/repo/TEST_REPO",
            "owner": "TEST_USER",
            "repo": "TEST_REPO",
          },
          {
            "group": "github/org/TEST_ORG/repo/TEST_REPO",
            "owner": "TEST_ORG",
            "repo": "TEST_REPO",
          },
        ],
        "parsedTeams": [
          {
            "group": "github/org/TEST_ORG/team/TEST_TEAM",
            "org": "TEST_ORG",
            "team": "TEST_TEAM",
          },
        ],
        "parsedUsers": [
          {
            "group": "github/user/TEST_USER",
            "user": "TEST_USER",
          },
        ],
        "token": "token",
        "url_prefix": "/verdaccio/",
      }
    `)
  })
})
