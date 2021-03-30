import { createTestAuthCore, testOrg, testUsername } from "test/utils"

import { AuthCore } from "src/server/plugin/AuthCore"

describe("AuthCore", () => {
  describe("authenticate", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    function expectTrue(groups: string[]) {
      const result = core.authenticate(testUsername, groups)
      return expect(result).toBe(true)
    }

    function expectFalse(groups: string[]) {
      const result = core.authenticate(testUsername, groups)
      return expect(result).toBe(false)
    }

    it("true", () => {
      expectTrue([testOrg])
      expectTrue(["A", testOrg])
    })

    it("false", () => {
      expectFalse([])
      expectFalse(["A"])
    })
  })
})
