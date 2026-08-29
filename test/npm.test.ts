import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

import { getNpmConfigFile, getRegistryUrl, saveNpmToken } from "src/npm"
import { afterEach, describe, expect, it } from "vitest"

export const testRegistryUrl = "http://localhost:4873"
export const testNpmToken = "test-npm-token"

const argv = process.argv
const originalUserconfig = process.env.NPM_CONFIG_USERCONFIG

let tempDir: string | undefined

function restoreUserconfig() {
  if (typeof originalUserconfig === "string") {
    process.env.NPM_CONFIG_USERCONFIG = originalUserconfig
  } else {
    delete process.env.NPM_CONFIG_USERCONFIG
  }
}

function createTempNpmrc() {
  tempDir = mkdtempSync(join(tmpdir(), "verdaccio-github-oauth-ui-"))
  const npmrc = join(tempDir, ".npmrc")

  writeFileSync(npmrc, "")
  process.env.NPM_CONFIG_USERCONFIG = npmrc

  return npmrc
}

describe("npm", () => {
  afterEach(() => {
    process.argv = argv
    restoreUserconfig()

    if (tempDir) {
      rmSync(tempDir, { force: true, recursive: true })
      tempDir = undefined
    }
  })

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

  it("saves the token to the user npmrc", async () => {
    const npmrc = createTempNpmrc()

    process.argv = [...argv, "--registry", testRegistryUrl]

    await saveNpmToken(testNpmToken)

    expect(readFileSync(npmrc, "utf8")).toMatchInlineSnapshot(
      `"//localhost:4873/:_authToken=test-npm-token\n"`,
    )
  })

  it("treats a trailing slash in the registry URL the same when saving", async () => {
    const npmrc = createTempNpmrc()

    process.argv = [...argv, "--registry", testRegistryUrl + "/"]

    await saveNpmToken(testNpmToken)

    expect(readFileSync(npmrc, "utf8")).toMatchInlineSnapshot(
      `"//localhost:4873/:_authToken=test-npm-token\n"`,
    )
  })

  it("stores tokens containing quotes as config values", async () => {
    const npmrc = createTempNpmrc()
    const token = `"; ignored; #`

    process.argv = [...argv, "--registry", testRegistryUrl]

    await saveNpmToken(token)

    expect(readFileSync(npmrc, "utf8")).toMatchInlineSnapshot(`
      "//localhost:4873/:_authToken="\\; ignored\\; \\#
      "
    `)
  })
})
