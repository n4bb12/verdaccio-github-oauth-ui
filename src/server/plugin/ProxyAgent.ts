import { bootstrap } from "global-agent"

import { logger } from "./logger"

declare const GLOBAL_AGENT: any

export function registerGlobalProxyAgent() {
  bootstrap()
  logger.log("Proxy config:", JSON.stringify(GLOBAL_AGENT || {}))
}
