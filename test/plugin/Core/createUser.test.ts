import { AuthCore } from "src/server/plugin/AuthCore"
import { PluginConfig } from "src/server/plugin/Config"

import { createTestAuthCore, createTestPluginConfig } from "../test-utils"

const username = "test-user"

describe("Plugin", () => {
  describe("createUser", () => {

    let core: AuthCore
    let config: PluginConfig

    beforeEach(() => {
      core = createTestAuthCore()
      config = createTestPluginConfig()
    })

    it("user contains configured username", () => {
      const user = core.createUser(username)
      expect(user.name).toBe(username)
    })

    it("user groups includes the configured org", () => {
      const user = core.createUser(username)
      expect(user.groups).toContain(config.org)
      expect(user.real_groups).toContain(config.org)
    })

  })
})
