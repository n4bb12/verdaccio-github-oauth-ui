import { createTestAuthCore, testUserName } from "test/utils"
import { describe, expect, it } from "vitest"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    it("the name is correct", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(testUserName)

      expect(user.name).toEqual(testUserName)
    })

    it("groups contain the correct tokens", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(testUserName)

      expect(user.groups).toMatchInlineSnapshot(`
        [
          "\$all",
          "@all",
          "\$authenticated",
          "@authenticated",
        ]
      `)
    })
  })
})
