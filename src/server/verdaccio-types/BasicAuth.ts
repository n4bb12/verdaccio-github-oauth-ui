import { AuthPluginPackage } from "./AuthPluginPackage "
import { Callback } from "./Callback"
import { RemoteUser } from "./RemoteUser"

export interface BasicAuth {
  config: any
  aesEncrypt(buf: Buffer): Buffer
  authenticate(user: string, password: string, cb: Callback): void
  changePassword(user: string, password: string, newPassword: string, cb: Callback): void
  allow_access(pkg: AuthPluginPackage, user: RemoteUser, callback: Callback): void
  add_user(user: string, password: string, cb: Callback): any
}
