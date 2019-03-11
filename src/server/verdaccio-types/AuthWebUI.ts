import { RemoteUser } from "@verdaccio/types"

import { JWTSignOptions } from "./JWTSignOptions"

export interface AuthWebUI {
  jwtEncrypt(user: RemoteUser, signOptions: JWTSignOptions): string
  aesEncrypt(buf: Buffer): Buffer
}
