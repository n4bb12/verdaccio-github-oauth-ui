import { AuthProvider } from "./AuthProvider"
import { logger } from "./logger"

interface CachedGroups {
  groups: string[]
  expires: number
}

/**
 * When installing packages, the CLI makes a burst of package requests.
 *
 * If we were to perform a full authentication check and fetch the provider groups
 * on each package request, this would slow down the process a lot and we would
 * likely hit a request limit with the auth provider.
 *
 * Therefore authentication is only performed once and is cached until no request
 * has been made for a few seconds.
 */
export class Cache {

  private readonly cache: { [cacheId: string]: CachedGroups } = {}

  constructor(
    private readonly provider: AuthProvider,
    private readonly cacheTTLms = 1000 * 5, // 5s
  ) { }

  async getGroups(token: string): Promise<string[]> {
    const { cache, provider, cacheTTLms } = this
    const cacheId = [provider.getId(), token].join("_")

    const invalidate = () => delete cache[cacheId]
    const cached = () => cache[cacheId] || {}
    const nearFuture = () => Date.now() + cacheTTLms

    if (cached().expires < Date.now()) {
      invalidate()
    } else {
      cached().expires = nearFuture()
    }

    if (!cached().groups) {
      try {
        const groups = await provider.getGroups(token)
        cache[cacheId] = {
          groups,
          expires: nearFuture(),
        }
      } catch (error) {
        logger.error(error.message)
      }
    }

    return cached().groups || []
  }

}
