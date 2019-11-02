import { AuthCore } from "src/server/plugin/AuthCore"

import {
  createTestAuthCore,
  testRequiredGroup,
  testUsername,
} from "../test-utils"

describe("AuthCore", () => {
  describe("canAuthenticate", () => {

    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    function expectTrue(groups: string[]) {
      const result = core.canAuthenticate(testUsername, groups)
      return expect(result).toBe(true)
    }

    function expectFalse(groups: string[]) {
      const result = core.canAuthenticate(testUsername, groups)
      return expect(result).toBe(false)
    }

    it("true", () => {
      expectTrue([testRequiredGroup])
      expectTrue(["A", testRequiredGroup])
      expectTrue(["A", testRequiredGroup, "B"])
    })

    it("false", () => {
      expectFalse([])
      expectFalse(["A"])
    })

  })
})
