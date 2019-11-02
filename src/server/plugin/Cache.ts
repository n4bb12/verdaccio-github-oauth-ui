import { AuthProvider } from "./AuthProvider"
import { logger } from "./logger"

interface CachedGroups {
  groups: string[]
  expires: number
}

const cacheTTLms = 1000 * 5 // 5s
const cache: { [username: string]: CachedGroups } = {}

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

  constructor(
    private readonly provider: AuthProvider,
  ) { }

  async getGroups(token: string): Promise<string[]> {
    const cacheId = [this.provider.getId(), token].join("_")

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
        const groups = await this.provider.getGroups(token)
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
