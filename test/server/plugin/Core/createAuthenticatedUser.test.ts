import {
  createTestAuthCore,
  testGroups,
  testUserName,
} from "test/utils"
import { describe, expect, it } from "vitest"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    it("the name is correct", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        testUserName,
        testGroups,
      )

      expect(user.name).toEqual(testUserName)
    })

    it("groups contain the correct tokens", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        testUserName,
        testGroups,
      )

      expect(user.groups).toMatchInlineSnapshot(`
        [
          "\$all",
          "@all",
          "\$authenticated",
          "@authenticated",
          "verdaccio",
          "verdaccio-publish",
          "verdaccio-unpublish",
        ]
      `)
    })
  })
})
