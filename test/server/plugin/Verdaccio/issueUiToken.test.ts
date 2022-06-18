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
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6WyJnaXRodWIvb3JnL1RFU1RfT1JHIiwiZ2l0aHViL29yZy9URVNUX09SRy90ZWFtL1RFU1RfVEVBTSIsImdpdGh1Yi9vcmcvVEVTVF9PUkcvcmVwby9URVNUX1JFUE8iLCJnaXRodWIvdXNlci9URVNUX1VTRVIiLCJnaXRodWIvdXNlci9URVNUX1VTRVIvcmVwby9URVNUX1JFUE8iXSwibmFtZSI6IlRFU1RfVVNFUiIsImdyb3VwcyI6WyIkYWxsIiwiQGFsbCIsIiRhdXRoZW50aWNhdGVkIiwiQGF1dGhlbnRpY2F0ZWQiLCJnaXRodWIvb3JnL1RFU1RfT1JHIiwiZ2l0aHViL29yZy9URVNUX09SRy90ZWFtL1RFU1RfVEVBTSIsImdpdGh1Yi9vcmcvVEVTVF9PUkcvcmVwby9URVNUX1JFUE8iLCJnaXRodWIvdXNlci9URVNUX1VTRVIiLCJnaXRodWIvdXNlci9URVNUX1VTRVIvcmVwby9URVNUX1JFUE8iXSwiaWF0IjowLCJuYmYiOjAsImV4cCI6NjA0ODAwfQ.0aUF_DZR7qkueRR9KZ6bdhjOLfWvlSxeps2DAA-aHsM"',
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
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsX2dyb3VwcyI6WyJnaXRodWIvb3JnL1RFU1RfT1JHIiwiZ2l0aHViL29yZy9URVNUX09SRy90ZWFtL1RFU1RfVEVBTSIsImdpdGh1Yi9vcmcvVEVTVF9PUkcvcmVwby9URVNUX1JFUE8iLCJnaXRodWIvdXNlci9URVNUX1VTRVIiLCJnaXRodWIvdXNlci9URVNUX1VTRVIvcmVwby9URVNUX1JFUE8iXSwibmFtZSI6IlRFU1RfVVNFUiIsImdyb3VwcyI6WyIkYWxsIiwiQGFsbCIsIiRhdXRoZW50aWNhdGVkIiwiQGF1dGhlbnRpY2F0ZWQiLCJnaXRodWIvb3JnL1RFU1RfT1JHIiwiZ2l0aHViL29yZy9URVNUX09SRy90ZWFtL1RFU1RfVEVBTSIsImdpdGh1Yi9vcmcvVEVTVF9PUkcvcmVwby9URVNUX1JFUE8iLCJnaXRodWIvdXNlci9URVNUX1VTRVIiLCJnaXRodWIvdXNlci9URVNUX1VTRVIvcmVwby9URVNUX1JFUE8iXSwiaWF0IjowLCJuYmYiOjAsImV4cCI6ODY0MDB9.GoWJvsj6p88GcOKSAG02wygBw2qOiSHzqWOxmDHodvM"',
      )
    })
  })
})
