import { createTestAuthCore, testGroups, testUsername } from "test/utils"

import { AuthCore } from "src/server/plugin/AuthCore"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("the created user contains the expected information", async () => {
      const user = await core.createAuthenticatedUser(testUsername, testGroups)

      expect(user).toMatchInlineSnapshot(`
        Object {
          "groups": Array [
            "$all",
            "@all",
            "$authenticated",
            "@authenticated",
          ],
          "name": "test-username",
          "real_groups": Array [
            "test-username",
            "github/TEST_ORG",
            "unrelated_org",
            "github/TEST_ORG/TEST_TEAM",
            "github/TEST_ORG/unrelated_team",
          ],
        }
      `)
    })
  })
})
