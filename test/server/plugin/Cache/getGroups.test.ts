import { delay } from "lodash"
import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Cache } from "src/server/plugin/Cache"
import {
  createTestAuthProvider,
  testErrorMessage,
  testOAuthToken,
} from "test/utils"
import timekeeper from "timekeeper"

describe("Cache", () => {
  describe("getGroups", () => {
    const cacheTTLms = 200
    let provider: AuthProvider
    let cache: Cache

    function configureSucceedingProvider(
      getGroups: (token: string) => string[],
    ) {
      provider = createTestAuthProvider()
      provider.getGroups = jest.fn((token) => Promise.resolve(getGroups(token)))
      cache = new Cache(provider, cacheTTLms)
    }

    function configureFailingProvider() {
      provider = createTestAuthProvider()
      jest
        .spyOn(provider, "getGroups")
        .mockRejectedValue(new Error(testErrorMessage))
      cache = new Cache(provider, cacheTTLms)
    }

    it("fetches groups from the provider", async () => {
      const expectedGroups = ["some-group"]
      configureSucceedingProvider(() => expectedGroups)

      const groups = await cache.getGroups(testOAuthToken)

      expect(provider.getGroups).toHaveBeenCalledWith(testOAuthToken)
      expect(groups).toEqual(expectedGroups)
    })

    it("caches groups", async () => {
      configureSucceedingProvider(() => [])

      await cache.getGroups(testOAuthToken)
      await cache.getGroups(testOAuthToken)

      expect(provider.getGroups).toHaveBeenCalledTimes(1)
    })

    it("invalidates cached groups after its ttl passed", async () => {
      configureSucceedingProvider(() => [])

      const timeFirstCall = new Date("2021-11-27T00:00:00.000Z")
      timekeeper.freeze(timeFirstCall)

      await cache.getGroups(testOAuthToken)

      // multiply by 1.5 to avoid flake
      const timeSecondCall = new Date(
        `2021-11-27T00:00:00.${cacheTTLms * 1.5}Z`,
      )
      timekeeper.travel(timeSecondCall)

      await cache.getGroups(testOAuthToken)

      timekeeper.reset()

      expect(provider.getGroups).toHaveBeenCalledTimes(2)
    })

    it("automatically extends the cache ttl on access", async () => {
      configureSucceedingProvider(() => [])

      timekeeper.freeze(new Date())

      for (let i = 0; i < 5; i++) {
        const time = new Date(`2021-11-27T00:00:00.${cacheTTLms * 0.5 * i}Z`)
        timekeeper.travel(time)
        await cache.getGroups(testOAuthToken)
      }

      timekeeper.reset()

      expect(provider.getGroups).toHaveBeenCalledTimes(1)
    })

    it("returns empty groups when an error occurs", async () => {
      configureFailingProvider()

      const groups = await cache.getGroups(testOAuthToken)

      expect(groups).toEqual([])
    })

    it("distinguishes between different tokens", async () => {
      configureSucceedingProvider((token) => [token])

      const aGroups = await cache.getGroups("goat")
      const bGroups = await cache.getGroups("cheese")

      expect(provider.getGroups).toHaveBeenCalledTimes(2)
      expect(aGroups).toEqual(["goat"])
      expect(bGroups).toEqual(["cheese"])
    })
  })
})
