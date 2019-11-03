import { getConfigFile, getRegistry, getSaveCommands } from "src/cli/npm"
import { getUsageInfo, printUsage } from "src/cli/usage"
import { testBaseUrl, testNPMToken } from "test/utils"

describe("CLI", () => {

  const argv = process.argv

  describe("usage", () => {
    it("usage info matches the snapshot", () => {
      expect(getUsageInfo()).toMatchSnapshot()
    })

    it("does not throw an error", () => {
      printUsage()
    })
  })

  describe("npm", () => {
    it("successfully finds the npm configuration", () => {
      expect(getRegistry()).toBeTruthy()
      expect(getConfigFile()).toBeTruthy()
    })

    it("uses the correct registry", () => {
      process.argv = argv
      const first = getRegistry()
      process.argv = [...argv, "--registry", testBaseUrl]
      const second = getRegistry()

      expect(first).toBeTruthy()
      expect(second).toBe(testBaseUrl)
      expect(first).not.toBe(second)
    })

    it("removes trailing slashes", () => {
      process.argv = [...argv, "--registry", "https://my.registry.com/"]
      expect(getRegistry()).toBe("https://my.registry.com")
    })

    it("save commands match the snapshot", () => {
      expect(getSaveCommands(testBaseUrl, testNPMToken)).toMatchSnapshot()
    })
  })

})
