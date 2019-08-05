import { ConfigFile, IBasicAuth, JWTSignOptions, RemoteUser} from "@verdaccio/types"
export interface AuthWebUI extends IBasicAuth<ConfigFile> {
  jwtEncrypt(user: RemoteUser, signOptions?: JWTSignOptions): Promise<string>
}
