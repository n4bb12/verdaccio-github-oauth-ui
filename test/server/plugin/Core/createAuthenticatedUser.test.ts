import { createTestAuthCore, testUsername } from "test/utils"

import { AuthCore } from "src/server/plugin/AuthCore"

describe("AuthCore", () => {
  describe("createAuthenticatedUser", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("the created user contains the expected information", () => {
      const user = core.createAuthenticatedUser(testUsername)

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
            "TEST_ORG",
          ],
        }
      `)
    })
  })
})
