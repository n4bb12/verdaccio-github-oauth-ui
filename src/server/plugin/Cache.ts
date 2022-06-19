import { Cache as MemoryCache } from "memory-cache"

import { logger } from "../../logger"
import { AuthProvider } from "./AuthProvider"

/**
 * When installing packages, the CLI makes a burst of package requests.
 *
 * If we were to perform a full authentication check and fetch the provider groups
 * on each package request, this would slow down the process a lot and we would
 * likely hit a request limit with the auth provider.
 *
 * Therefore authentication is only performed once and is cached until no request
 * has been made for a short period.
 */
export class Cache {
  private readonly cache = new MemoryCache<string, string[]>()
  private readonly providerId = this.authProvider.getId()

  constructor(
    private readonly authProvider: AuthProvider,
    private readonly cacheTTLms = 10_000, // 10s
  ) {}

  async getGroups(userName: string): Promise<string[]> {
    let groups: string[] | null = null

    try {
      const key = `${this.providerId}/${userName}`

      groups = this.cache.get(key)

      if (!groups) {
        groups = await this.authProvider.getGroups(userName)
      }

      this.cache.put(key, groups || [], this.cacheTTLms)
    } catch (error) {
      logger.error(error)
    }

    return groups || []
  }
}
