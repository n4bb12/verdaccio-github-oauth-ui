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
      expect(token).toBeTruthy()
    })

    it("respects the api security config", async () => {
      const config = createTestVerdaccioConfig({
        security: { api: { jwt: { sign: { expiresIn: "1d" } } } },
      })
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueNpmToken(testUser, testOAuthToken)
      expect(token).toMatchInlineSnapshot(
        `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6W10sIm5hbWUiOiJURVNUX1VTRVIiLCJncm91cHMiOlsiJGFsbCIsIkBhbGwiLCIkYXV0aGVudGljYXRlZCIsIkBhdXRoZW50aWNhdGVkIl0sImlhdCI6MCwibmJmIjowLCJleHAiOjg2NDAwfQ.pVit9D2_TwQNmJGjsRLbv3Ph3wUgzzCwTCfOEm6nWYY"`,
      )
    })
  })
})
