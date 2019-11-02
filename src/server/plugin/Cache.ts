import { AuthProvider } from "./AuthProvider"
import { logger } from "./logger"

interface CachedGroups {
  groups: string[]
  expires: number
}

const cacheTTLms = 1000 * 5 // 5s
const cache: { [username: string]: CachedGroups } = {}

export class Cache {

  constructor(
    private readonly provider: AuthProvider,
  ) { }

  async getGroups(username: string, token: string): Promise<string[]> {
    const cacheId = [this.provider.getId(), username, token].join("_")

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
