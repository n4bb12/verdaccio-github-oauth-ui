import { AuthCore } from "src/server/plugin/AuthCore"
import {
  createTestAuthCore,
  testRequiredGroup,
  testRequiredTeam,
  testUsername,
} from "test/utils"

describe("AuthCore", () => {
  describe("authenticate", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    function expectTrue(groups: string[], teams: string[]) {
      const result = core.authenticate(testUsername, groups, teams)
      return expect(result).toBe(true)
    }

    function expectFalse(groups: string[], teams: string[]) {
      const result = core.authenticate(testUsername, groups, teams)
      return expect(result).toBe(false)
    }

    it("true", () => {
      expectTrue([testRequiredGroup], [testRequiredTeam])
      expectTrue(["A", testRequiredGroup], [testRequiredTeam])
      expectTrue(["A", testRequiredGroup, "B"], [testRequiredTeam])
      expectTrue(["A", testRequiredGroup, "B"], ["A", testRequiredTeam])
    })

    it("false", () => {
      expectFalse([], [])
      expectFalse(["A"], [])
      expectFalse(["A", testRequiredGroup], [])
      expectFalse(["A", testRequiredGroup], ["A"])
    })
  })
})
