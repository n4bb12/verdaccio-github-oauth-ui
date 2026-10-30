import express from "express"
import { AddressInfo } from "node:net"
import { Server } from "node:http"
import { pluginKey } from "src/constants"
import { Plugin } from "src/server/plugin/Plugin"
import { afterEach, describe, expect, it } from "vitest"
import { createTestVerdaccioConfig, testClientId } from "test/utils"

describe("Plugin.register_middlewares", () => {
  let server: Server | undefined

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server!.close(resolve))
    }
    server = undefined
  })

  async function authorizeLocation(plugin: Plugin) {
    const app = express()
    plugin.register_middlewares(app, {})
    server = app.listen(0, "127.0.0.1")
    await new Promise((resolve) => server!.once("listening", resolve))
    const { port } = server.address() as AddressInfo
    const response = await fetch(`http://127.0.0.1:${port}/-/oauth/authorize`, {
      redirect: "manual",
    })
    return response.headers.get("location")
  }

  function expectAuthorizeRedirect(location: string | null) {
    expect(location).toContain(`client_id=${testClientId}`)
    expect(location).toContain(encodeURIComponent("/-/oauth/callback"))
  }

  it("redirects when constructed with the verdaccio 6 config", async () => {
    expectAuthorizeRedirect(
      await authorizeLocation(new Plugin(createTestVerdaccioConfig())),
    )
  })

  it("redirects when verdaccio 7 passes only the auth section", async () => {
    const fullConfig = createTestVerdaccioConfig()

    expectAuthorizeRedirect(
      await authorizeLocation(
        new Plugin(fullConfig.auth[pluginKey] as any, { config: fullConfig }),
      ),
    )
  })
})
