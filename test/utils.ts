import { AllowAccess, RemoteUser } from "@verdaccio/types"
import { Request } from "express"
import { authenticatedUserGroups, pluginKey } from "src/constants"
import { AuthCore } from "src/server/plugin/AuthCore"
import { AuthProvider } from "src/server/plugin/AuthProvider"
import {
  Config,
  PackageAccess,
  ParsedPluginConfig,
  PluginConfig,
} from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import { Verdaccio } from "src/server/plugin/Verdaccio"
import timekeeper from "timekeeper"
import Auth from "verdaccio/build/lib/auth"
import { afterEach, beforeEach, vi } from "vitest"

vi.mock("src/server/google/AuthProvider", () => ({
  GoogleAuthProvider: vi
    .fn()
    .mockImplementation(() => createTestAuthProvider()),
}))

export const testOrgGroup = `github/org/TEST_ORG`
export const testOrgTeamGroup = `github/org/TEST_ORG/team/TEST_TEAM`
export const testOrgRepoGroup = `github/org/TEST_ORG/repo/TEST_REPO`
export const testUserName = "TEST_USER"
export const testUserGroup = `github/user/TEST_USER`
export const testUserRepoGroup = `github/user/TEST_USER/repo/TEST_REPO`

export const testProviderGroups = [
  // regular groups
  testOrgGroup,
  testOrgTeamGroup,
  testOrgRepoGroup,
  testUserGroup,
  testUserRepoGroup,
]

export const testPackagesConfig = {
  testPackage1: { access: testOrgGroup },
  testPackage2: { access: testOrgTeamGroup },
  testPackage3: { access: testOrgRepoGroup },
  testPackage4: { access: testUserGroup },
  testPackage5: { access: testUserRepoGroup },
}

export const testClientId = "CLIENT_ID"
export const testClientSecret = "CLIENT_SECRET"
export const testToken = "TOKEN"
export const testEnterpriseOrigin = "TEST_ENTERPRISE_ORIGIN"
export const testProviderId = "AUTH_PROVIDER"
export const testLoginUrl = "LOGIN_URL"
export const testOAuthCode = "OAUTH_CODE"
export const testOAuthToken = "OAUTH_TOKEN"
export const testRegistryToken = "REGISTRY_TOKEN"
export const testMajorVersion = 4
export const testUiToken = "UI_TOKEN"
export const testNpmToken = "NPM_TOKEN"
export const testErrorMessage = "EXPECTED_ERROR"

export const testUser = createTestUser(testProviderGroups)

export function createTestPluginConfig(
  pluginConfig?: Partial<PluginConfig>,
): PluginConfig {
  return {
    "client-id": testClientId,
    "client-secret": testClientSecret,
    ...pluginConfig,
  }
}

export function createTestVerdaccioConfig(
  verdaccioConfig: Partial<Config> = {},
  pluginConfig: Partial<PluginConfig> = {},
) {
  return {
    auth: {
      [pluginKey]: createTestPluginConfig(pluginConfig),
      ...verdaccioConfig.auth,
    },
    middlewares: {
      [pluginKey]: {
        enabled: true,
      },
      ...verdaccioConfig.middlewares,
    },
    packages: {
      ...testPackagesConfig,
      ...verdaccioConfig.packages,
    },
    ...verdaccioConfig,
  } as Config
}

export function createTestParsedPluginConfig(
  pluginConfig?: Partial<PluginConfig>,
): ParsedPluginConfig {
  const verdaccioConfig = createTestVerdaccioConfig({}, pluginConfig)
  return new ParsedPluginConfig(verdaccioConfig)
}

export function createTestVerdaccio(config: Partial<Config> = {}) {
  const verdaccio = new Verdaccio(createTestVerdaccioConfig(config))
  verdaccio.issueUiToken = vi.fn(() => Promise.resolve(testUiToken))
  verdaccio.issueNpmToken = vi.fn(() => Promise.resolve(testNpmToken))
  return verdaccio
}

export function createTestAuthProvider() {
  const provider: AuthProvider = {
    getId() {
      return testProviderId
    },
    getLoginUrl() {
      return testLoginUrl
    },
    getCode(req: Request) {
      return testOAuthCode
    },
    async getToken(code: string) {
      return code === testOAuthCode ? testOAuthToken : ""
    },
    async getUserName(userToken: string) {
      if (userToken === testOAuthToken) {
        return testUserName
      }
      throw new Error(testErrorMessage)
    },
    async getGroups(userName: string) {
      if (userName === testUserName) {
        return [...testProviderGroups]
      }
      return []
    },
  }
  return provider
}

export function createTestAuthCore(config: Partial<Config> = {}) {
  return new AuthCore(
    createTestVerdaccio(config),
    new ParsedPluginConfig(createTestVerdaccioConfig(config)),
  )
}

export function createTestPlugin(config: Partial<Config> = {}) {
  return new Plugin(createTestVerdaccioConfig(config))
}

export function createTestUser(groups: string[]): RemoteUser {
  return {
    name: testUserName,
    groups: [...authenticatedUserGroups, ...groups],
    real_groups: [...groups],
  }
}

export function createTestPackage(
  access: PackageAccess,
): AllowAccess & PackageAccess {
  return {
    name: "test-package",
    ...access,
  }
}

class PatchedAuth extends Auth {
  constructor(config: any) {
    super(config)
  }
  _loadPlugin() {
    return []
  }
}

export function createRealVerdaccioAuth(config: Partial<Config> = {}): Auth {
  return new PatchedAuth({ secret: "test-secret", ...config })
}

export function freezeTimeDuringTests(date: Date = new Date(0)) {
  beforeEach(() => {
    timekeeper.freeze(date)
  })
  afterEach(() => {
    timekeeper.reset()
  })
}
