import { createTestAuthCore, testProviderGroups, testUsername } from "test/utils"

import { AuthCore } from "src/server/plugin/AuthCore"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("the created user contains the expected information", async () => {
      const user = await core.createAuthenticatedUser(testUsername, testProviderGroups)

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
            "another_org",
            "github/TEST_ORG/TEST_TEAM",
            "github/TEST_ORG/another_team",
            "github/TEST_ORG/repo/TEST_REPO",
            "github/TEST_ORG/repo/another_repo",
          ],
        }
      `)
    })
  })
})
