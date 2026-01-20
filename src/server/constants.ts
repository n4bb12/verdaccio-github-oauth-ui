import { pluginKey } from "../constants"

// Parcel will replace `__dirname` with the directory of the source file during
// the build. Using `eval` prevents this static analysis and substitution,
// allowing us to access the `__dirname` of the compiled output file at runtime
// to locate the adjacent client assets.
const fileDirectory = eval("__dirname")

export const publicRoot = fileDirectory + "/../client"
export const staticPath = "/-/static/" + pluginKey
