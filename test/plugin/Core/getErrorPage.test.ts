import { AuthCore } from "src/server/plugin/AuthCore"

import { createTestAuthCore, testUsername } from "../test-utils"

describe("AuthCore", () => {
  describe("getErrorPage", () => {

    let core: AuthCore

    beforeEach(() => {
      core = createTestAuthCore()
    })

    it("does not throw an error", () => {
      core.getErrorPage(testUsername)
    })

  })
})
