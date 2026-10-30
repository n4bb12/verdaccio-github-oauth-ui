import express from "express"
import { AddressInfo } from "node:net"
import { Server } from "node:http"
import { cliPort, pluginKey } from "src/constants"
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

  async function start(plugin: Plugin) {
    const app = express()
    plugin.register_middlewares(app, {})
    app.get("/ui", (_req, res) => {
      res.send(
        '<html><body><script src="/-/static/ui-options.js"></script></body></html>',
      )
    })

    server = app.listen(0, "127.0.0.1")
    await new Promise((resolve) => server!.once("listening", resolve))
    const { port } = server.address() as AddressInfo
    return `http://127.0.0.1:${port}`
  }

  async function expectLoginSurface(plugin: Plugin) {
    const baseUrl = await start(plugin)
    const callback = encodeURIComponent("/-/oauth/callback")
    const cliCallback = encodeURIComponent("/-/oauth/callback/cli")

    const authorize = await fetch(`${baseUrl}/-/oauth/authorize`, {
      redirect: "manual",
    })
    const authorizeLocation = authorize.headers.get("location")
    expect(authorize.status).toBe(302)
    expect(authorizeLocation).toContain(`client_id=${testClientId}`)
    expect(authorizeLocation).toContain(callback)
    expect(authorizeLocation).not.toContain(cliCallback)

    const cliAuthorize = await fetch(`${baseUrl}/-/oauth/authorize/cli`, {
      redirect: "manual",
    })
    expect(cliAuthorize.status).toBe(302)
    expect(cliAuthorize.headers.get("location")).toContain(cliCallback)

    const webCallback = await fetch(`${baseUrl}/-/oauth/callback`)
    expect(webCallback.status).toBe(500)
    expect(await webCallback.text()).toContain(pluginKey)

    const cliCallbackResponse = await fetch(`${baseUrl}/-/oauth/callback/cli`, {
      redirect: "manual",
    })
    expect(cliCallbackResponse.status).toBe(302)
    expect(cliCallbackResponse.headers.get("location")).toContain(
      `http://localhost:${cliPort}`,
    )

    const ui = await fetch(`${baseUrl}/ui`)
    expect(await ui.text()).toContain("verdaccio-6.js")
  }

  it("serves login, callback, and the ui script for the verdaccio 6 config", async () => {
    await expectLoginSurface(new Plugin(createTestVerdaccioConfig()))
  })

  it("serves them when verdaccio 7 passes only the middleware section", async () => {
    const fullConfig = createTestVerdaccioConfig()

    await expectLoginSurface(
      new Plugin(fullConfig.middlewares[pluginKey] as any, {
        config: fullConfig,
      }),
    )
  })
})
