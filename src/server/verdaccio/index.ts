import { RemoteUser } from "@verdaccio/types"

import {
  IAuthWebUI as Verdaccio3IAuthWebUI,
  IUser as Verdaccio3IUser,
} from "./verdaccio-3-internal-types"
import { IAuth, IAuthWebUI } from "./verdaccio-4-internal-types"

export { Verdaccio } from "./Verdaccio"

export type Auth = Verdaccio3IAuthWebUI & IAuth
export type AuthWebUI = IAuthWebUI
export type User = Verdaccio3IUser & RemoteUser
