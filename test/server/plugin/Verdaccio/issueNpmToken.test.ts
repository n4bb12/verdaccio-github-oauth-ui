import { Verdaccio } from "src/server/plugin/Verdaccio"
import {
  createRealVerdaccioAuth,
  createTestVerdaccioConfig,
  freezeTimeDuringTests,
  testOAuthToken,
  testUser,
} from "test/utils"
import { describe, expect, it } from "vitest"

describe("Verdaccio", () => {
  describe("issueNpmToken", () => {
    freezeTimeDuringTests()

    it("correctly issues a token", async () => {
      const config = createTestVerdaccioConfig()
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueNpmToken(testUser, testOAuthToken)
      expect(token).toMatchInlineSnapshot(
        '"gJA8ArOiaBC1JZ+ycyQkpD3Tt6ylH4q7v2+wGqV/VgI="',
      )
    })

    it("respects the api security config", async () => {
      const config = createTestVerdaccioConfig({
        security: { api: { jwt: { sign: { expiresIn: "1d" } } } },
      })
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueNpmToken(testUser, testOAuthToken)
      expect(token).toMatchInlineSnapshot(
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6WyJ2ZXJkYWNjaW8iLCJ2ZXJkYWNjaW8tcHVibGlzaCIsInZlcmRhY2Npby11bnB1Ymxpc2giXSwibmFtZSI6IlRFU1RfVVNFUiIsImdyb3VwcyI6WyIkYWxsIiwiQGFsbCIsIiRhdXRoZW50aWNhdGVkIiwiQGF1dGhlbnRpY2F0ZWQiLCJ2ZXJkYWNjaW8iLCJ2ZXJkYWNjaW8tcHVibGlzaCIsInZlcmRhY2Npby11bnB1Ymxpc2giXSwiaWF0IjowLCJuYmYiOjAsImV4cCI6ODY0MDB9.UnhJ9pReZCHM4PZqKAKwCckTfbU1d_fw3vJlNmmE2Lw"',
      )
    })
  })
})
