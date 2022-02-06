import { Verdaccio } from "src/server/plugin/Verdaccio"
import {
  createRealVerdaccioAuth,
  createTestConfig,
  freezeTimeDuringTests,
  testOAuthToken,
  testUser,
} from "test/utils"
import { describe, expect, it } from "vitest"

describe("Verdaccio", () => {
  describe("issueNpmToken", () => {
    freezeTimeDuringTests()

    it("correctly issues a token", async () => {
      const config = createTestConfig()
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueNpmToken(testOAuthToken, testUser)
      expect(token).toMatchInlineSnapshot(
        `"QQj9+h4vAdScdEhfulw1y8cJwSsnCYy7b365h2a729Y="`,
      )
    })

    it("respects the api security config", async () => {
      const config = createTestConfig({
        security: { api: { jwt: { sign: { expiresIn: "1d" } } } },
      })
      const auth = createRealVerdaccioAuth(config)
      const verdaccio = new Verdaccio(config).setAuth(auth)

      const token = await verdaccio.issueNpmToken(testOAuthToken, testUser)
      expect(token).toMatchInlineSnapshot(
        `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6WyJnaXRodWIvb3duZXIvVEVTVF9MT0dJTl9PUkciLCJnaXRodWIvb3duZXIvVEVTVF9PUkciLCJnaXRodWIvb3duZXIvVEVTVF9PUkcvdGVhbS9URVNUX1RFQU0iLCJnaXRodWIvb3duZXIvVEVTVF9PUkcvcmVwby9URVNUX1JFUE8iLCJnaXRodWIvb3duZXIvVEVTVF9VU0VSIiwiZ2l0aHViL1RFU1RfTEVHQUNZX09SRyIsImdpdGh1Yi9URVNUX0xFR0FDWV9PUkcvVEVTVF9MRUdBQ1lfVEVBTSIsImdpdGh1Yi9vd25lci9hbm90aGVyX29yZyIsImdpdGh1Yi9vd25lci9hbm90aGVyX29yZy90ZWFtL2Fub3RoZXJfdGVhbSIsImdpdGh1Yi9vd25lci9hbm90aGVyX29yZy9yZXBvL2Fub3RoZXJfcmVwbyIsImdpdGh1Yi9hbm90aGVyX2xlZ2FjeV9vcmciLCJnaXRodWIvYW5vdGhlcl9sZWdhY3lfb3JnL2Fub3RoZXJfbGVnYWN5X3RlYW0iXSwibmFtZSI6InRlc3QtdXNlcm5hbWUiLCJncm91cHMiOlsiJGFsbCIsIkBhbGwiLCIkYXV0aGVudGljYXRlZCIsIkBhdXRoZW50aWNhdGVkIiwiZ2l0aHViL293bmVyL1RFU1RfTE9HSU5fT1JHIiwiZ2l0aHViL293bmVyL1RFU1RfT1JHIiwiZ2l0aHViL293bmVyL1RFU1RfT1JHL3RlYW0vVEVTVF9URUFNIiwiZ2l0aHViL293bmVyL1RFU1RfT1JHL3JlcG8vVEVTVF9SRVBPIiwiZ2l0aHViL293bmVyL1RFU1RfVVNFUiIsImdpdGh1Yi9URVNUX0xFR0FDWV9PUkciLCJnaXRodWIvVEVTVF9MRUdBQ1lfT1JHL1RFU1RfTEVHQUNZX1RFQU0iLCJnaXRodWIvb3duZXIvYW5vdGhlcl9vcmciLCJnaXRodWIvb3duZXIvYW5vdGhlcl9vcmcvdGVhbS9hbm90aGVyX3RlYW0iLCJnaXRodWIvb3duZXIvYW5vdGhlcl9vcmcvcmVwby9hbm90aGVyX3JlcG8iLCJnaXRodWIvYW5vdGhlcl9sZWdhY3lfb3JnIiwiZ2l0aHViL2Fub3RoZXJfbGVnYWN5X29yZy9hbm90aGVyX2xlZ2FjeV90ZWFtIiwiZ2l0aHViL293bmVyL1RFU1RfTE9HSU5fT1JHIiwiZ2l0aHViL293bmVyL1RFU1RfT1JHIiwiZ2l0aHViL293bmVyL1RFU1RfT1JHL3RlYW0vVEVTVF9URUFNIiwiZ2l0aHViL293bmVyL1RFU1RfT1JHL3JlcG8vVEVTVF9SRVBPIiwiZ2l0aHViL293bmVyL1RFU1RfVVNFUiIsImdpdGh1Yi9URVNUX0xFR0FDWV9PUkciLCJnaXRodWIvVEVTVF9MRUdBQ1lfT1JHL1RFU1RfTEVHQUNZX1RFQU0iLCJnaXRodWIvb3duZXIvYW5vdGhlcl9vcmciLCJnaXRodWIvb3duZXIvYW5vdGhlcl9vcmcvdGVhbS9hbm90aGVyX3RlYW0iLCJnaXRodWIvb3duZXIvYW5vdGhlcl9vcmcvcmVwby9hbm90aGVyX3JlcG8iLCJnaXRodWIvYW5vdGhlcl9sZWdhY3lfb3JnIiwiZ2l0aHViL2Fub3RoZXJfbGVnYWN5X29yZy9hbm90aGVyX2xlZ2FjeV90ZWFtIl0sImlhdCI6MCwibmJmIjowLCJleHAiOjg2NDAwfQ.Z72SvWV7cEZmRqF3nj5a9sc-y50HkFJadGJcsroPMPg"`,
      )
    })
  })
})
