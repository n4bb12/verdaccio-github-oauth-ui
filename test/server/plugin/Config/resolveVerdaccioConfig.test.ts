import { pluginKey } from "src/constants"
import {
  isSupportedVerdaccioVersion,
  resolveVerdaccioConfig,
} from "src/server/plugin/Config"
import { createTestVerdaccioConfig } from "test/utils"
import { describe, expect, it } from "vitest"

describe("verdaccio config compatibility", () => {
  const fullConfig = createTestVerdaccioConfig()
  const authSection = fullConfig.auth[pluginKey]
  const middlewareSection = fullConfig.middlewares[pluginKey]

  it("accepts verdaccio 5, 6, and 7", () => {
    expect(isSupportedVerdaccioVersion("5.33.0")).toBe(true)
    expect(isSupportedVerdaccioVersion("6.10.1")).toBe(true)
    expect(isSupportedVerdaccioVersion("7.0.2")).toBe(true)
    expect(isSupportedVerdaccioVersion("4.13.2")).toBe(false)
  })

  it("keeps the merged config verdaccio 5 and 6 pass as the first argument", () => {
    expect(resolveVerdaccioConfig(fullConfig)).toBe(fullConfig)
    expect(resolveVerdaccioConfig(fullConfig, { config: fullConfig })).toBe(
      fullConfig,
    )
  })

  it("uses options.config when verdaccio 7 passes only the plugin section", () => {
    expect(
      resolveVerdaccioConfig(authSection as any, { config: fullConfig }),
    ).toBe(fullConfig)
    expect(
      resolveVerdaccioConfig(middlewareSection as any, { config: fullConfig }),
    ).toBe(fullConfig)
  })

  it("uses options.config whenever it is present", () => {
    const hostConfig = { url_prefix: "/" } as typeof fullConfig

    expect(resolveVerdaccioConfig(fullConfig, { config: hostConfig })).toBe(
      hostConfig,
    )
  })
})
