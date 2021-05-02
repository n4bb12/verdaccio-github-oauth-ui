import {
  buildAccessDeniedPage,
  buildErrorPage,
  buildStatusPage,
} from "src/statusPage"

import { testErrorMessage } from "./utils"

describe("Shared", () => {
  describe("buildStatusPage", () => {
    it("generic page matches the snapshot", () => {
      expect(buildStatusPage("custom test body", true)).toMatchSnapshot()
    })
    it("error page matches the snapshot", () => {
      const error = new Error(testErrorMessage)
      expect(buildErrorPage(error, true)).toMatchSnapshot()
    })
    it("access denied page matches the snapshot", () => {
      expect(buildAccessDeniedPage(true)).toMatchSnapshot()
    })
  })
})
