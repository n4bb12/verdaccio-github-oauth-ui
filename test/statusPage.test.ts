import { buildStatusPage } from "src/statusPage"

describe("Shared", () => {
  describe("buildStatusPage", () => {
    it("matches the snapshot", () => {
      expect(buildStatusPage("custom test body")).toMatchSnapshot()
    })
  })
})
