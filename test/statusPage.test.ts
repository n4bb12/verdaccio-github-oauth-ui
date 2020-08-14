import {
  accessDeniedPage,
  buildErrorPage,
  buildStatusPage,
} from "src/statusPage"

import { testErrorMessage } from "./utils"

describe("Shared", () => {
  describe("buildStatusPage", () => {
    it("generic page matches the snapshot", () => {
      expect(buildStatusPage("custom test body")).toMatchSnapshot()
    })
    it("error page matches the snapshot", () => {
      expect(buildErrorPage(new Error(testErrorMessage))).toMatchSnapshot()
    })
    it("access denied page matches the snapshot", () => {
      expect(accessDeniedPage).toMatchSnapshot()
    })
  })
})
