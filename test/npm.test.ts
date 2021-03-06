import { getNpmConfigFile, getNpmSaveCommands, getRegistryUrl } from "src/npm"
import { testBaseUrl, testNPMToken } from "test/utils"

describe("npm", () => {
  const argv = process.argv

  it("successfully finds the npm configuration", () => {
    expect(getRegistryUrl()).toBeTruthy()
    expect(getNpmConfigFile()).toBeTruthy()
  })

  it("uses the correct registry", () => {
    process.argv = argv
    const first = getRegistryUrl()
    process.argv = [...argv, "--registry", testBaseUrl]
    const second = getRegistryUrl()

    expect(first).toBeTruthy()
    expect(second).toBe(testBaseUrl)
    expect(first).not.toBe(second)
  })

  it("removes trailing slashes", () => {
    process.argv = [...argv, "--registry", "https://my.registry.com/"]
    expect(getRegistryUrl()).toBe("https://my.registry.com")
  })

  it("save commands match the snapshot", () => {
    expect(getNpmSaveCommands(testBaseUrl, testNPMToken)).toMatchSnapshot()
  })
})
