import { pluginName } from "src/constants"
import {
  createTestAuthCore,
  testProviderGroups,
  testUsername,
} from "test/utils"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    it("the user contains the correct name", async () => {
      const username = "test-username"
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        username,
        testProviderGroups,
      )

      expect(user.name).toMatchInlineSnapshot(`"test-username"`)
    })

    it("authenticated user groups contain the correct tokens", async () => {
      const core = createTestAuthCore()

      const user = await core.createAuthenticatedUser(
        testUsername,
        testProviderGroups,
      )

      expect(user.groups).toMatchInlineSnapshot(`
        Array [
          "$all",
          "@all",
          "$authenticated",
          "@authenticated",
        ]
      `)
    })

    it("authenticated user real_groups always contain the username and required org", async () => {
      const username = "test-username"
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
        packages: {},
      })

      const user = await core.createAuthenticatedUser(username, providerGroups)

      expect(user.real_groups).toMatchInlineSnapshot(`
        Array [
          "test-username",
          "github/test-org",
        ]
      `)
    })

    it("authenticated user real_groups contain groups used in the package access and publish config, but nothing else", async () => {
      const username = "test-username"
      const providerGroups = ["a", "b", "c", "d", "e"]
      const core = createTestAuthCore({
        packages: {
          foo: {
            publish: "a",
            access: "b",
            proxy: "_",
            storage: "_",
          },
          bar: {
            publish: "c",
            access: "d",
            proxy: "_",
            storage: "_",
          },
        },
      })

      const user = await core.createAuthenticatedUser(username, providerGroups)

      expect(user.real_groups).toMatchInlineSnapshot(`
        Array [
          "test-username",
          "github/TEST_ORG",
          "a",
          "b",
          "c",
          "d",
        ]
      `)
    })
  })
})
