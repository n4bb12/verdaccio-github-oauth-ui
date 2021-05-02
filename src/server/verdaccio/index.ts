import { RemoteUser } from "@verdaccio/types"

import { IAuth, IAuthWebUI } from "./verdaccio-4-internal-types"

export { Verdaccio } from "./Verdaccio"

export type Auth = IAuth
export type AuthWebUI = IAuthWebUI
export type User = RemoteUser
