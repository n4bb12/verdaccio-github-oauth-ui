import { AuthCore } from "src/server/plugin/AuthCore"
import {
  createTestAuthCore,
  testOAuthToken,
  testGroups,
  testUserName,
} from "test/utils"
import { beforeEach, describe, expect, it } from "vitest"

describe("AuthCore", () => {
  describe("createUiCallbackUrl", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("contains username, uiToken and npmToken", async () => {
      const url = await core.createUiCallbackUrl(
        testUserName,
        testGroups,
        testOAuthToken,
      )

      expect(url).toMatchInlineSnapshot(
        '"/?username=TEST_USER&uiToken=UI_TOKEN&npmToken=NPM_TOKEN"',
      )
    })
  })
})
