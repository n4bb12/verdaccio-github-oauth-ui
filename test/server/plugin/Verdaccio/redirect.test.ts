import { getAuthorizePath, getCallbackPath } from "src/redirect"
import { describe, expect, it } from "bun:test"

describe("redirect", () => {
  it("getAuthorizePath", () => {
    expect(getAuthorizePath()).toMatchInlineSnapshot(`"/-/oauth/authorize"`)
    expect(getAuthorizePath("auth-id")).toMatchInlineSnapshot(
      `"/-/oauth/authorize/auth-id"`,
    )
  })

  it("getCallbackPath", () => {
    expect(getCallbackPath()).toMatchInlineSnapshot(`"/-/oauth/callback"`)
    expect(getCallbackPath("auth-id")).toMatchInlineSnapshot(
      `"/-/oauth/callback/auth-id"`,
    )
  })
})
