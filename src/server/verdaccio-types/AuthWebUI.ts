import { JWTSignOptions } from "./JWTSignOptions"
import { RemoteUser } from "./RemoteUser"

export interface AuthWebUI {
  jwtEncrypt(user: RemoteUser, signOptions: JWTSignOptions): string
  aesEncrypt(buf: Buffer): Buffer
}
