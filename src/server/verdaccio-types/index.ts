import {
  IPluginAuth,
  IPluginMiddleware,
  IStorageManager,
  PackageAccess,
  RemoteUser,
} from "@verdaccio/types"

export * from "./Auth"
export * from "./AuthCallback"
export * from "./Config"
export * from "./Storage"

export type Callback = () => void

export type AuthPlugin<T = any> = IPluginAuth<T>
export type MiddlewarePlugin<T = any> = IPluginMiddleware<T>
export type StorageManager<T = any> = IStorageManager<T>

export { RemoteUser, PackageAccess }
