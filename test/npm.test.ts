import { getNpmConfigFile, getNpmSaveCommand, getRegistryUrl } from "src/npm"
import { describe, expect, it } from "vitest"

export const testRegistryUrl = "http://localhost:4873"
export const testNpmToken = "test-npm-token"

describe("npm", () => {
  const argv = process.argv

  it("successfully finds the npm configuration", () => {
    expect(getRegistryUrl()).toMatchInlineSnapshot(
      `"https://registry.npmjs.org"`,
    )
    expect(getNpmConfigFile()).toContain(".npmrc")
  })

  it("uses the correct registry", () => {
    process.argv = argv
    const url1 = getRegistryUrl()

    process.argv = [...argv, "--registry", testRegistryUrl]
    const url2 = getRegistryUrl()

    expect(url1).toMatchInlineSnapshot(`"https://registry.npmjs.org"`)
    expect(url2).toBe(testRegistryUrl)
  })

  it("removes trailing slashes", () => {
    process.argv = [...argv, "--registry", "https://my.registry.com/"]

    expect(getRegistryUrl()).toMatchInlineSnapshot('"https://my.registry.com"')
  })

  it("save commands match the snapshot", () => {
    const command1 = getNpmSaveCommand(testRegistryUrl, testNpmToken)
    expect(command1).toMatchInlineSnapshot(
      `"npm config set //localhost:4873/:_authToken "test-npm-token""`,
    )

    const command2 = getNpmSaveCommand(testRegistryUrl + "/", testNpmToken)
    expect(command2).toMatchInlineSnapshot(
      `"npm config set //localhost:4873/:_authToken "test-npm-token""`,
    )
  })
})
