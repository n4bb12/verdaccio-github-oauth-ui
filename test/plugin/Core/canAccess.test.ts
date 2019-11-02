import { AuthCore } from "src/server/plugin/AuthCore"

import { createTestAuthCore } from "../test-utils"

const username = "test-user"

describe("Plugin", () => {
  describe("canAccess", () => {

    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    function expectTrue(groups: string[], requiredGroups: string[]) {
      const result = core.canAccess(username, groups, requiredGroups)
      return expect(result).toBe(true)
    }

    function expectFalse(groups: string[], requiredGroups: string[]) {
      const result = core.canAccess(username, groups, requiredGroups)
      return expect(result).toBe(false)
    }

    it("true", () => {
      expectTrue([], [])
      expectTrue(["A"], ["A"])
      expectTrue(["A", "B"], ["A"])
      expectTrue(["A", "B"], ["B"])
      expectTrue(["B", "A"], ["A"])
      expectTrue(["B", "A"], ["B"])
      expectTrue(["A", "B"], ["A", "B"])
      expectTrue(["A", "B"], ["B", "A"])
      expectTrue(["B", "A"], ["A", "B"])
      expectTrue(["B", "A"], ["B", "A"])
    })

    it("false", () => {
      expectFalse(["A"], ["B"])
      expectFalse(["B"], ["A"])
    })

  })
})
