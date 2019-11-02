import { parse } from "querystring"
import { AuthCore } from "src/server/plugin/AuthCore"

import {
  createTestAuthCore,
  testNPMToken,
  testOAuthToken,
  testUIToken,
  testUsername,
} from "../test-utils"

describe("AuthCore", () => {
  describe("createUiCallbackUrl", () => {

    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("contains username, uiToken and npmToken", async () => {
      const url = await core.createUiCallbackUrl(testUsername, testOAuthToken)
      const credentials = parse(url.substr(url.indexOf("?") + 1))

      expect(credentials.username).toBe(testUsername)
      expect(credentials.uiToken).toBe(testUIToken)
      expect(credentials.npmToken).toBe(testNPMToken)
    })

  })
})
