import { describe, expect, it } from "vitest"
import { parseJwt } from "src/client/plugin/lib"

const MOCK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6WyJnaXRodWIvb3JnL3Rlc3Qtb3JnIl0sIm5hbWUiOiJKb2huRG9lIiwiZ3JvdXBzIjpbIiRhbGwiLCJAYWxsIiwiJGF1dGhlbnRpY2F0ZWQiLCJAYXV0aGVudGljYXRlZCIsImdpdGh1Yi9vcmcvdGVzdC1vcmciXSwiaWF0IjoxNzE2NTIxNzY0LCJuYmYiOjE3MTY1MjE3NjQsImV4cCI6MTcxOTExMzc2NH0.O9UoSVBvKyM5UAJzoVa_kNvjJR0C06SP57nVXwzxEBY"

describe("parseJwt", () => {
  it("should decode a valid JWT token", () => {
    const decodedToken = parseJwt(MOCK_TOKEN)

    expect(decodedToken).toEqual({
      real_groups: ["github/org/test-org"],
      name: "JohnDoe",
      groups: [
        "$all",
        "@all",
        "$authenticated",
        "@authenticated",
        "github/org/test-org",
      ],
      iat: 1716521764,
      nbf: 1716521764,
      exp: 1719113764,
    })
  })
})
