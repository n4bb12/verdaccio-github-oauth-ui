import { pluginKey } from "../constants"
import { runtimeDirname } from "./runtime-path"

// The published bundle lives in dist/server, next to dist/client.
// Tests load this file from src/server instead.
const fileDirectory = runtimeDirname()

export const publicRoot = fileDirectory + "/../client"
export const staticPath = "/-/static/" + pluginKey
