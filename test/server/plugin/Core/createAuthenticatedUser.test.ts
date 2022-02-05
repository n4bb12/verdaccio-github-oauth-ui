import { pluginName } from "src/constants"
import {
  createTestAuthCore,
  testProviderGroups,
  testUsername,
} from "test/utils"
import { describe, expect, it } from "vitest"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    it("the name is correct", async () => {
      const username = "test-username"
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        username,
        testProviderGroups,
      )

      expect(user.name).toMatchInlineSnapshot(`"test-username"`)
    })

    it("groups contain the correct tokens", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        testUsername,
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

    it("real_groups always contain the username", async () => {
      const username = "test-username"
      const providerGroups = []
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(username, providerGroups)

      expect(user.real_groups).toMatchInlineSnapshot(`
        [
          "test-username",
        ]
      `)
    })

    it("real_groups contains the required login org if configured", async () => {
      const org = "test-org"
      const providerGroups = []
      const core = createTestAuthCore({
        auth: {
          [pluginName]: {
            org,
            "client-id": "_",
            "client-secret": "_",
          },
        },
      })

      const user = await core.createAuthenticatedUser(
        testUsername,
        providerGroups,
      )

      expect(user.real_groups).toMatchInlineSnapshot(`
        [
          "github/owner/test-org",
          "test-username",
        ]
      `)
    })

    it("real_groups contain groups used in the package access and publish config, but nothing else", async () => {
      const username = "test-username"
      const providerGroups = ["a", "b", "c", "d", "e", "f", "g"]
      const core = createTestAuthCore({
        packages: {
          foo: {
            access: ["a"],
            publish: ["b"],
            unpublish: ["c"],
            proxy: ["_"],
            storage: "_",
          },
          bar: {
            access: ["d"],
            publish: ["e"],
            unpublish: ["f"],
            proxy: ["_"],
            storage: "_",
          },
        },
      })

      const user = await core.createAuthenticatedUser(username, providerGroups)

      expect(user.real_groups).toMatchInlineSnapshot(`
        [
          "a",
          "b",
          "c",
          "d",
          "e",
          "f",
          "test-username",
        ]
      `)
    })
  })
})
