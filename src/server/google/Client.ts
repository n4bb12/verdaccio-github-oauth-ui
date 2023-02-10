import { existsSync } from "fs"
import { admin_directory_v1, google, Auth } from "googleapis"
import { GaxiosResponse } from "googleapis-common"
import { ParsedPluginConfig, GroupsConfig } from "../plugin/Config"

export class GoogleClient {
  private readonly config: ParsedPluginConfig

  constructor(config: ParsedPluginConfig) {
    this.config = config
  }

  getLoginUrl = (redirectUrl: string) => {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      redirectUrl,
    )
    try {
      return oauth2Client.generateAuthUrl({
        access_type: "offline",
        client_id: this.config.clientId,
        hd: this.config.domain,
        prompt: this.config.prompt,
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
          "openid",
        ],
      })
    } catch (error) {
      throw new Error("Failed generating Google OAuth URL: " + error.message)
    }
  }

  requestAccessToken = async (code: string, redirectUrl: string) => {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      redirectUrl,
    )

    try {
      return await oauth2Client.getToken(code)
    } catch (error) {
      throw new Error(
        "Failed requesting Google OAuth access token: " + error.message,
      )
    }
  }

  requestUser = async (accessToken: string) => {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    })

    try {
      const d = await oauth2.userinfo.get()
      return d.data
    } catch (error) {
      throw new Error("Failed requesting Google user info: " + error.message)
    }
  }

  requestGroups = async (accessToken: string, userEmail: string) => {
    if (this.config.groupsConfig) {
      const oauth2Client = new google.auth.GoogleAuth(
        this.buildGoogleAuthOptions(this.config.groupsConfig),
      )
      const admin = google.admin({
        version: "directory_v1",
        auth: oauth2Client,
      })

      try {
        const groups = await admin.groups.list({
          userKey: userEmail,
        })
        return groups
      } catch (error) {
        throw new Error(
          "Failed requesting Google user groups: " + error.message,
        )
      }
    } else {
      const defaultGroups: GaxiosResponse<admin_directory_v1.Schema$Groups> = {
        config: {},
        data: {
          groups: [
            {
              name: "google",
            },
          ],
        },
        status: 200,
        statusText: "default groups",
        headers: {},
        request: {
          responseURL: "default groups",
        },
      }
      return defaultGroups
    }
  }

  private buildGoogleAuthOptions(groupsConfig: GroupsConfig) {
    const googleAuthOptions: Auth.GoogleAuthOptions = {
      scopes: "https://www.googleapis.com/auth/admin.directory.group.readonly",
      clientOptions: {
        subject: groupsConfig["impersonation-account"],
      },
    }
    if (existsSync(groupsConfig["key-info"])) {
      googleAuthOptions.keyFile = groupsConfig["key-info"]
    } else {
      googleAuthOptions.credentials = JSON.parse(groupsConfig["key-info"])
    }

    return googleAuthOptions
  }
}
