import {
  createTestAuthCore,
  testGroups,
  testOAuthToken,
  testOrg,
  testTeam,
  testUsername,
} from "test/utils"

import { AuthCore } from "src/server/plugin/AuthCore"

describe("AuthCore", () => {
  describe("createUiCallbackUrl", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("contains username, uiToken and npmToken", async () => {
      const url = await core.createUiCallbackUrl(
        testUsername,
        testOAuthToken,
        testGroups,
      )

      expect(url).toMatchInlineSnapshot(
        `"/?username=test-username&uiToken=test-ui-token&npmToken=test-npm-token"`,
      )
    })
  })
})
