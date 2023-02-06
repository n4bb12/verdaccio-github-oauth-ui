import got from "got"
import { GoogleOAuth } from "./GoogleOAuth"
import { GoogleUser } from "./User"

export class GoogleClient {
  constructor(
    private readonly tokenBaseUrl: string,
    private readonly userInfoBaseUrl: string,
  ) {}

  requestAccessToken = async (
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUrl: string,
  ) => {
    const url = this.tokenBaseUrl + "/token"
    const options = {
      method: "POST",
      json: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUrl,
        code,
      },
    } as const
    try {
      return got(url, options).json<GoogleOAuth>() as unknown as GoogleOAuth
    } catch (error) {
      throw new Error(
        "Failed requesting Google OAuth access token: " + error.message,
      )
    }
  }

  requestUser = async (accessToken: string) => {
    const url = this.userInfoBaseUrl + "/v1/userinfo"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const
    try {
      return got(url, options).json<GoogleUser>() as unknown as GoogleUser
    } catch (error) {
      throw new Error("Failed requesting Google user info: " + error.message)
    }
  }
}
