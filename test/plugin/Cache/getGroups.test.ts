import { AuthProvider } from "src/server/plugin/AuthProvider"
import { Cache } from "src/server/plugin/Cache"

import { createTestAuthProvider, delay, testOAuthToken } from "../test-utils"

describe("Cache", () => {
  describe("getGroups", () => {

    const cacheTTLms = 20
    let provider: AuthProvider
    let cache: Cache

    function configureProvider(getGroups: (token: string) => string[]) {
      provider = createTestAuthProvider()
      jest.spyOn(provider, "getGroups").mockImplementation(
        (token) => Promise.resolve(getGroups(token)),
      )
      cache = new Cache(provider, cacheTTLms)
    }

    function configureErrorProvider() {
      provider = createTestAuthProvider()
      jest.spyOn(provider, "getGroups").mockRejectedValue(new Error())
      cache = new Cache(provider, cacheTTLms)
    }

    it("fetches groups from the provider", async () => {
      configureProvider(() => ["bread"])

      const groups = await cache.getGroups(testOAuthToken)

      expect(provider.getGroups).toHaveBeenCalledWith(testOAuthToken)
      expect(groups).toEqual(["bread"])
    })

    it("caches groups", async () => {
      configureProvider(() => [])

      await cache.getGroups(testOAuthToken)
      await cache.getGroups(testOAuthToken)

      expect(provider.getGroups).toHaveBeenCalledTimes(1)
    })

    it("invalidates cached groups after its ttl passed", async () => {
      configureProvider(() => [])

      await cache.getGroups(testOAuthToken)
      await delay(cacheTTLms * 2) // ensure it's not flaky
      await cache.getGroups(testOAuthToken)

      expect(provider.getGroups).toHaveBeenCalledTimes(2)
    })

    it("returns empty groups when an error occurs", async () => {
      configureErrorProvider()

      const groups = await cache.getGroups(testOAuthToken)

      expect(provider.getGroups).toHaveBeenCalledTimes(1)
      expect(groups).toEqual([])
    })

    it("distinguishes between different tokens", async () => {
      configureProvider((token) => [token])

      const aGroups = await cache.getGroups("goat")
      const bGroups = await cache.getGroups("cheese")

      expect(provider.getGroups).toHaveBeenCalledTimes(2)
      expect(aGroups).toEqual(["goat"])
      expect(bGroups).toEqual(["cheese"])
    })

  })
})
