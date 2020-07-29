import {
  createTestAuthCore,
  testNPMToken,
  testOAuthToken,
  testUIToken,
  testUsername,
} from "test/utils"
import { parse } from "url"

import { AuthCore } from "src/server/plugin/AuthCore"

describe("AuthCore", () => {
  describe("createUiCallbackUrl", () => {
    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("contains username, uiToken and npmToken", async () => {
      const url = await core.createUiCallbackUrl(testOAuthToken, testUsername)
      const { username, uiToken, npmToken } = parse(url, true).query

      expect(username).toBe(testUsername)
      expect(uiToken).toBe(testUIToken)
      expect(npmToken).toBe(testNPMToken)
    })
  })
})
