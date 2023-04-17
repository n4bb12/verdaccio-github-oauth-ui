import { describe, expect, it } from "vitest"
import { parseCookies } from "src/client/plugin/lib"

const MOCK_COOKIE = "uiToken=UI_TOKEN; npmToken=NPM_TOKEN; username=TEST_USER"

describe("parseCookies", () => {
  it("should decode valid cookie string", () => {
    expect(parseCookies(MOCK_COOKIE)).toEqual({
      uiToken: "UI_TOKEN",
      npmToken: "NPM_TOKEN",
      username: "TEST_USER",
    })
  })

  it("should handle empty string", () => {
    expect(parseCookies("")).toEqual({})
  })
})
