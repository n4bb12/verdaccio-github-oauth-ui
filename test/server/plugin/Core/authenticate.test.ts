import { pluginName } from "src/constants"
import { AuthCore } from "src/server/plugin/AuthCore"
import { Config } from "src/server/plugin/Config"
import {
  createTestAuthCore,
  createTestPluginConfig,
  testLoginOrgGroup,
  testLoginOrgName,
  testUsername,
  unrelatedOrgGroup,
} from "test/utils"

describe("AuthCore", () => {
  describe("authenticate", () => {
    let core: AuthCore

    const configWithMandatoryLoginOrg: Partial<Config> = {
      auth: {
        [pluginName]: createTestPluginConfig({ org: testLoginOrgName }),
      },
    }

    const configWithoutMandatoryLoginOrg: Partial<Config> = {
      auth: {
        [pluginName]: createTestPluginConfig({ org: false }),
      },
    }

    function expectAccessGranted(groups: string[]) {
      const result = core.authenticate(testUsername, groups)
      return expect(result).toBe(true)
    }

    function expectAccessDenied(groups: string[]) {
      const result = core.authenticate(testUsername, groups)
      return expect(result).toBe(false)
    }

    describe("with mandatory login org", () => {
      beforeEach(() => {
        core = createTestAuthCore(configWithMandatoryLoginOrg)
      })

      it("should grant login access", () => {
        expectAccessGranted([testLoginOrgGroup])
        expectAccessGranted([unrelatedOrgGroup, testLoginOrgGroup])
      })

      it("should deny login access", () => {
        expectAccessDenied([])
        expectAccessDenied([unrelatedOrgGroup])
      })
    })

    describe("without mandatory login org", () => {
      beforeEach(() => {
        core = createTestAuthCore(configWithoutMandatoryLoginOrg)
      })

      it("should grant login access", () => {
        expectAccessGranted([testLoginOrgGroup])
        expectAccessGranted([unrelatedOrgGroup, testLoginOrgGroup])
        expectAccessGranted([unrelatedOrgGroup])
      })

      it("should deny login access", () => {
        expectAccessDenied([])
      })
    })
  })
})
