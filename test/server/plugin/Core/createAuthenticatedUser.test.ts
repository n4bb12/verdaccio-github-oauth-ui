import {
  createTestAuthCore,
  testProviderGroups,
  testUserName,
} from "test/utils"
import { describe, expect, it } from "vitest"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    it("the name is correct", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        testUserName,
        testProviderGroups,
      )

      expect(user.name).toEqual(testUserName)
    })

    it("groups contain the correct tokens", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        testUserName,
        testProviderGroups,
      )

      expect(user.groups).toMatchInlineSnapshot(`
        [
          "\$all",
          "@all",
          "\$authenticated",
          "@authenticated",
        ]
      `)
    })

    it("real_groups contains groups used in the packages config, but nothing else", async () => {
      const providerGroups = [
        "github/user/a",
        "github/user/b",
        "github/user/c",
        "github/user/d",
        "github/user/e",
        "github/user/f",
        "github/user/g",
      ]
      const core = createTestAuthCore({
        packages: {
          foo: {
            access: ["github/user/a"],
            publish: ["github/user/b"],
            unpublish: ["github/user/c"],
            proxy: ["_"],
            storage: "_",
          },
          bar: {
            access: ["github/user/d"],
            publish: ["github/user/e"],
            unpublish: ["github/user/f"],
            proxy: ["_"],
            storage: "_",
          },
        },
      })

      const user = await core.createAuthenticatedUser(
        testUserName,
        providerGroups,
      )

      expect(user.real_groups).toMatchInlineSnapshot(`
        [
          "github/user/a",
          "github/user/b",
          "github/user/c",
          "github/user/d",
          "github/user/e",
          "github/user/f",
        ]
      `)
    })
  })
})
