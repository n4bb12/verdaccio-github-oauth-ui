import { Verdaccio } from "src/server/plugin/Verdaccio"
import {
  createRealVerdaccioAuth,
  createTestVerdaccioConfig,
  freezeTimeDuringTests,
  testUser,
} from "test/utils"
import { describe, expect, it } from "vitest"

describe("Verdaccio", () => {
  describe("issueUiToken", () => {
    freezeTimeDuringTests()

    it("correctly issues a token", async () => {
      const config = createTestVerdaccioConfig()
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueUiToken(testUser)
      expect(token).toMatchInlineSnapshot(
        `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6W10sIm5hbWUiOiJURVNUX1VTRVIiLCJncm91cHMiOlsiJGFsbCIsIkBhbGwiLCIkYXV0aGVudGljYXRlZCIsIkBhdXRoZW50aWNhdGVkIl0sImlhdCI6MCwibmJmIjowLCJleHAiOjYwNDgwMH0.KuO-PckiYSlOVc-jE5yAS2bAgTcRXVu9nRfI-c8ooQU"`,
      )
    })

    it("respects the web security config", async () => {
      const config = createTestVerdaccioConfig({
        security: { web: { sign: { expiresIn: "1d" } } },
      })
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueUiToken(testUser)
      expect(token).toMatchInlineSnapshot(
        `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6W10sIm5hbWUiOiJURVNUX1VTRVIiLCJncm91cHMiOlsiJGFsbCIsIkBhbGwiLCIkYXV0aGVudGljYXRlZCIsIkBhdXRoZW50aWNhdGVkIl0sImlhdCI6MCwibmJmIjowLCJleHAiOjg2NDAwfQ.pVit9D2_TwQNmJGjsRLbv3Ph3wUgzzCwTCfOEm6nWYY"`,
      )
    })
  })
})
