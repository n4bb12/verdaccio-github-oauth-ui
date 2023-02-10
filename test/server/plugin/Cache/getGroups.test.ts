import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Cache } from "src/server/plugin/Cache"
import {
  createTestAuthProvider,
  testErrorMessage,
  testOAuthToken,
} from "test/utils"
import timekeeper from "timekeeper"
import { describe, expect, it, vi } from "vitest"

describe("Cache", () => {
  describe("getGroups", () => {
    const cacheTTLms = 200
    let provider: AuthProvider
    let cache: Cache

    function configureSucceedingProvider(
      getGroups: (token: string, userName: string) => string[],
    ) {
      provider = createTestAuthProvider()
      provider.getGroups = vi.fn((token, user) => Promise.resolve(getGroups(token, user)))
      cache = new Cache(provider, cacheTTLms)
    }

    function configureFailingProvider() {
      provider = createTestAuthProvider()
      vi.spyOn(provider, "getGroups").mockRejectedValue(
        new Error(testErrorMessage),
      )
      cache = new Cache(provider, cacheTTLms)
    }

    it("fetches groups from the provider", async () => {
      const expectedGroups = ["some-group"]
      configureSucceedingProvider(() => expectedGroups)

      const groups = await cache.getGroups(testOAuthToken, "user")

      expect(provider.getGroups).toHaveBeenCalledWith(testOAuthToken, "user")
      expect(groups).toEqual(expectedGroups)
    })

    it("caches groups", async () => {
      configureSucceedingProvider(() => [])

      await cache.getGroups(testOAuthToken, "user")
      await cache.getGroups(testOAuthToken, "user")

      expect(provider.getGroups).toHaveBeenCalledTimes(1)
    })

    it("invalidates cached groups after its ttl passed", async () => {
      configureSucceedingProvider(() => [])

      const timeFirstCall = new Date("2021-11-27T00:00:00.000Z")
      timekeeper.freeze(timeFirstCall)

      await cache.getGroups(testOAuthToken, "user")

      // multiply by 1.5 to avoid flake
      const timeSecondCall = new Date(
        `2021-11-27T00:00:00.${cacheTTLms * 1.5}Z`,
      )
      timekeeper.travel(timeSecondCall)

      await cache.getGroups(testOAuthToken, "user")

      timekeeper.reset()

      expect(provider.getGroups).toHaveBeenCalledTimes(2)
    })

    it("automatically extends the cache ttl on access", async () => {
      configureSucceedingProvider(() => [])

      timekeeper.freeze(new Date())

      for (let i = 0; i < 5; i++) {
        const time = new Date(`2021-11-27T00:00:00.${cacheTTLms * 0.5 * i}Z`)
        timekeeper.travel(time)
        await cache.getGroups(testOAuthToken, "user")
      }

      timekeeper.reset()

      expect(provider.getGroups).toHaveBeenCalledTimes(1)
    })

    it("distinguishes between different tokens", async () => {
      configureSucceedingProvider((token) => [token])

      const aGroups = await cache.getGroups("goat", "user1")
      const bGroups = await cache.getGroups("cheese", "user2")

      expect(provider.getGroups).toHaveBeenCalledTimes(2)
      expect(aGroups).toEqual(["goat"])
      expect(bGroups).toEqual(["cheese"])
    })
  })
})
