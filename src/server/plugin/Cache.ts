import { AuthProvider } from "./AuthProvider"
import { pluginName } from "./Config"

interface CachedGroups {
  groups: string[]
  expires: number
}

function log(...args: any[]) {
  console.log(`${[pluginName]}`, ...args)
}

export class Cache {

  private readonly cacheTTLms = 1000 * 5 // 5s
  private readonly cache: { [username: string]: CachedGroups } = {}

  constructor(
    private readonly provider: AuthProvider,
  ) { }

  async getGroups(username: string, token: string): Promise<string[]> {
    const cacheId = username + token
    const invalidate = () => delete this.cache[cacheId]
    const cached = () => this.cache[cacheId] || {}
    const nearFuture = () => Date.now() + this.cacheTTLms

    if (cached().expires < Date.now()) {
      invalidate()
    } else {
      cached().expires = nearFuture()
    }

    if (!cached().groups) {
      try {
        const groups = await this.provider.getGroups(token)
        this.cache[cacheId] = {
          groups,
          expires: nearFuture(),
        }
      } catch (error) {
        log(error.message)
      }
    }

    return cached().groups || []
  }

}
