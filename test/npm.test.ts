import { getNpmConfigFile, getNpmSaveCommands, getRegistryUrl } from "src/npm"
import { describe, expect, it } from "vitest"

export const testRegistryUrl = "http://localhost:4873"
export const testNpmToken = "test-npm-token"

describe("npm", () => {
  const argv = process.argv

  it("successfully finds the npm configuration", () => {
    expect(getRegistryUrl()).toMatchInlineSnapshot(
      '"https://registry.yarnpkg.com"',
    )
    expect(getNpmConfigFile()).toContain(".npmrc")
  })

  it("uses the correct registry", () => {
    process.argv = argv
    const url1 = getRegistryUrl()

    process.argv = [...argv, "--registry", testRegistryUrl]
    const url2 = getRegistryUrl()

    expect(url1).toMatchInlineSnapshot('"https://registry.yarnpkg.com"')
    expect(url2).toBe(testRegistryUrl)
  })

  it("removes trailing slashes", () => {
    process.argv = [...argv, "--registry", "https://my.registry.com/"]

    expect(getRegistryUrl()).toMatchInlineSnapshot('"https://my.registry.com"')
  })

  it("save commands match the snapshot", () => {
    const commands1 = getNpmSaveCommands(testRegistryUrl, testNpmToken)
    expect(commands1).toMatchInlineSnapshot(`
      [
        "npm config set //localhost:4873/:_authToken "test-npm-token"",
      ]
    `)

    const commands2 = getNpmSaveCommands(testRegistryUrl + "/", testNpmToken)
    expect(commands2).toMatchInlineSnapshot(`
      [
        "npm config set //localhost:4873/:_authToken "test-npm-token"",
      ]
    `)
  })
})
