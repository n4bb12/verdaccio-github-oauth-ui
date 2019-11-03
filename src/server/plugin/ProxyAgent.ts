import { bootstrap } from "global-agent"

import { logger } from "../../logger"

declare const GLOBAL_AGENT: any

export function registerGlobalProxyAgent() {
  bootstrap()
  const config = JSON.stringify(GLOBAL_AGENT || {})
  logger.log("Proxy config:", config)
}
