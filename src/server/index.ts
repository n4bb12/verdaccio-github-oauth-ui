import { loadLocalEnv } from "./env"
import { Plugin } from "./plugin/Plugin"

loadLocalEnv()

// plugins must be a default export
export default Plugin
