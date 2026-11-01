import { testUserName } from "test/utils"
import { expect, it } from "bun:test"
import { createAuthenticatedUser } from "src/server/helpers"

it("createAuthenticatedUser", () => {
  const user = createAuthenticatedUser(testUserName)

  expect(user).toMatchInlineSnapshot(`
    {
      "groups": [
        "$all",
        "@all",
        "$authenticated",
        "@authenticated",
      ],
      "name": "TEST_USER",
      "real_groups": [],
    }
  `)
})
