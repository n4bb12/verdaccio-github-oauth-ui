import { bootstrap } from "global-agent"

import { pluginName } from "./Config"

declare const GLOBAL_AGENT: any

export function registerGlobalProxyAgent() {
  bootstrap()
  console.log(`${[pluginName]}] Proxy config:`, JSON.stringify(GLOBAL_AGENT || {}))
}
