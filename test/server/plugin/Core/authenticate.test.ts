import { AuthCore } from "src/server/plugin/AuthCore"
import { createTestAuthCore, testOrg, testUsername } from "test/utils"

describe("AuthCore", () => {
  describe("authenticate", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    function expectAccessGranted(groups: string[]) {
      const result = core.authenticate(testUsername, groups)
      return expect(result).toBe(true)
    }

    function expectAccessDenied(groups: string[]) {
      const result = core.authenticate(testUsername, groups)
      return expect(result).toBe(false)
    }

    it("should grant access", () => {
      expectAccessGranted([testOrg])
      expectAccessGranted(["invalid_org", testOrg])
    })

    it("should deny access", () => {
      expectAccessDenied([])
      expectAccessDenied(["invalid_org"])
    })
  })
})
