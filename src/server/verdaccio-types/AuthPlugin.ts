import { AuthCallback } from "./AuthCallback"
import { PackageAccess } from "./PackageAccess"
import { RemoteUser } from "./RemoteUser"

/**
 * https://verdaccio.org/docs/en/dev-plugins#authentication-plugin
 */
export interface AuthPlugin {
  login_url?: string
  adduser?: (user: string, password: string, cb: AuthCallback) => void
  allow_access?: (user: RemoteUser, pkg: PackageAccess, cb: AuthCallback) => void
  allow_publish?: (user: RemoteUser, pkg: PackageAccess, cb: AuthCallback) => void
  authenticate: (user: string, password: string, cb: AuthCallback) => void
}
