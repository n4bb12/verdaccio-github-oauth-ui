import { AuthCore } from "src/server/plugin/AuthCore"
import { PluginConfig } from "src/server/plugin/Config"

import { createTestAuthCore, createTestPluginConfig } from "../test-utils"

const username = "test-user"

describe("Plugin", () => {
  describe("canAuthenticate", () => {

    let core: AuthCore
    let config: PluginConfig

    beforeEach(() => {
      core = createTestAuthCore()
      config = createTestPluginConfig()
    })

    function expectTrue(groups: string[]) {
      const result = core.canAuthenticate(username, groups)
      return expect(result).toBe(true)
    }

    function expectFalse(groups: string[]) {
      const result = core.canAuthenticate(username, groups)
      return expect(result).toBe(false)
    }

    it("true", () => {
      expectTrue([config.org])
      expectTrue(["A", config.org])
      expectTrue(["A", config.org, "B"])
    })

    it("false", () => {
      expectFalse([])
      expectFalse(["A"])
    })

  })
})
