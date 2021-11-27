import { AllowAccess, RemoteUser } from "@verdaccio/types"
import { Request } from "express"
import { authenticatedUserGroups, pluginName } from "src/constants"
import { AuthCore } from "src/server/plugin/AuthCore"
import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Config, PackageAccess, PluginConfig } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import { Verdaccio } from "src/server/verdaccio/Verdaccio"
import timekeeper from "timekeeper"
import Auth from "verdaccio/build/lib/auth"

export const testLoginOrgName = "TEST_LOGIN_ORG"
export const testLoginOrgGroup = `github/owner/${testLoginOrgName}`
export const testOrgGroup = `github/owner/TEST_ORG`
export const testTeamGroup = `${testOrgGroup}/team/TEST_TEAM`
export const testRepoGroup = `${testOrgGroup}/repo/TEST_REPO`
export const testUserName = "TEST_USER"
export const testUserGroup = `github/owner/${testUserName}`
export const testLegacyOrgGroup = "github/TEST_LEGACY_ORG"
export const testLegacyTeamGroup = "github/TEST_LEGACY_ORG/TEST_LEGACY_TEAM"

export const unrelatedOrgGroup = "github/owner/another_org"
export const unrelatedTeamGroup = `${unrelatedOrgGroup}/team/another_team`
export const unrelatedRepoGroup = `${unrelatedOrgGroup}/repo/another_repo`
export const unrelatedLegacyOrgGroup = "github/another_legacy_org"
export const unrelatedLegacyTeamGroup =
  "github/another_legacy_org/another_legacy_team"

export const testProviderGroups = [
  // regular groups
  testLoginOrgGroup,
  testOrgGroup,
  testTeamGroup,
  testRepoGroup,
  testUserGroup,

  // legacy groups
  testLegacyOrgGroup,
  testLegacyTeamGroup,

  // unrelated regular groups
  unrelatedOrgGroup,
  unrelatedTeamGroup,
  unrelatedRepoGroup,

  // unrelated legacy groups
  unrelatedLegacyOrgGroup,
  unrelatedLegacyTeamGroup,
]

export const testClientId = "TEST_CLIENT_ID"
export const testClientSecret = "TEST_CLIENT_SECRET"
export const testUsername = "test-username"
export const testProviderId = "test-auth-provider"
export const testLoginUrl = "test-login-url"
export const testOAuthCode = "test-code"
export const testOAuthToken = "test-token"
export const testMajorVersion = 4
export const testUiToken = "test-ui-token"
export const testNpmToken = "test-npm-token"
export const testErrorMessage = "expected-error"
export const testUserAgent = "verdaccio/5.0.4"

export const testUser = createTestUser(testProviderGroups)

export function createTestPluginConfig(
  config?: Partial<PluginConfig>,
): PluginConfig {
  return {
    "client-id": testClientId,
    "client-secret": testClientSecret,
    org: false,
    ...config,
  }
}

export function createTestConfig(config: Partial<Config> = {}) {
  return {
    auth: {
      [pluginName]: createTestPluginConfig(),
    },
    middlewares: {
      [pluginName]: {
        enabled: true,
      },
    },
    user_agent: testUserAgent,
    ...config,
  } as Config
}

export function createTestVerdaccio(config: Partial<Config> = {}) {
  const verdaccio = new Verdaccio(createTestConfig(config))
  verdaccio.issueUiToken = jest.fn(() => Promise.resolve(testUiToken))
  verdaccio.issueNpmToken = jest.fn(() => Promise.resolve(testNpmToken))
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
    async getUsername(token: string) {
      return token === testOAuthToken ? testUsername : ""
    },
    async getGroups(token: string) {
      if (token !== testOAuthToken) {
        throw new Error("Invalid token")
      }
      return testProviderGroups
    },
  }
  return provider
}

export function createTestAuthCore(config: Partial<Config> = {}) {
  return new AuthCore(createTestVerdaccio(config), createTestConfig(config))
}

export function createTestPlugin(config: Partial<Config> = {}) {
  return new Plugin(createTestConfig(config))
}

export function createTestUser(groups: string[]): RemoteUser {
  return {
    name: testUsername,
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
