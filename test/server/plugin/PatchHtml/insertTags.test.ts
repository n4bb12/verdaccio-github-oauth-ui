import { describe, expect, it } from "vitest"
import { PatchHtml } from "src/server/plugin/PatchHtml"

const scriptPattern = /verdaccio-6\.js/

function createPatchHtml() {
  const config = { url_prefix: "" } as any
  return new PatchHtml(config)
}

function callInsertTags(html: string) {
  const patchHtml = createPatchHtml()
  const req = { headers: { host: "localhost:4873" }, protocol: "http" } as any
  // Access the private method via bracket notation
  return (patchHtml as any).insertTags(req, html)
}

// Verdaccio <=6.4 inlines the options in a <script> tag
const legacyHtml = `
  <!DOCTYPE html>
  <html><head>
    <script>window.__VERDACCIO_BASENAME_UI_OPTIONS={"base":"/"}</script>
  </head><body><div id="root"></div></body></html>
`

// Verdaccio >=6.5 loads options from an external script
const modernHtml = `
  <!DOCTYPE html>
  <html><head>
    <script src="/-/static/ui-options.js"></script>
  </head><body><div id="root"></div></body></html>
`

const jsonResponse = JSON.stringify({ name: "some-package", version: "1.0.0" })

describe("PatchHtml - insertTags", () => {
  it("injects the client script into legacy Verdaccio HTML (<=6.4)", () => {
    const result = callInsertTags(legacyHtml)
    expect(result).toMatch(scriptPattern)
  })

  it("injects the client script into modern Verdaccio HTML (>=6.5)", () => {
    const result = callInsertTags(modernHtml)
    expect(result).toMatch(scriptPattern)
  })

  it("does not modify non-HTML responses", () => {
    const result = callInsertTags(jsonResponse)
    expect(result).toBe(jsonResponse)
  })
})
