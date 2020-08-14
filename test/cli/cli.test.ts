import { getUsageInfo, printUsage } from "src/cli/usage"

describe("CLI", () => {
  describe("usage", () => {
    it("usage info matches the snapshot", () => {
      expect(getUsageInfo()).toMatchSnapshot()
    })

    it("does not throw an error", () => {
      printUsage()
    })
  })
})
