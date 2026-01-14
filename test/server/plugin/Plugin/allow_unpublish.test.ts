import { AllowAccess, PackageAccess, RemoteUser } from "@verdaccio/types"
import { Cache } from "src/server/plugin/Cache"
import { Plugin } from "src/server/plugin/Plugin"
import { createTestPackage, createTestPlugin, createTestUser } from "test/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

describe("Plugin", () => {
  let plugin: Plugin
  let user: RemoteUser
  let pkg: AllowAccess & PackageAccess
  let mockCache: Cache

  describe("allow_unpublish", () => {
    beforeEach(() => {
      plugin = createTestPlugin()

      // Create a mock implementation of Cache
      mockCache = {
        getGroups: vi.fn().mockResolvedValue([]),
      } as any

      // Replace the plugin's cache with our mock
      ;(plugin as any).cache = mockCache
    })

    it("does not grant access to unauthenticated users", async () => {
      user = {
        name: undefined,
        groups: ["$all", "$anonymous", "@all", "@anonymous"],
        real_groups: [],
      }
      pkg = createTestPackage({ access: ["any-group"] })

      await new Promise<void>((resolve) => {
        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          resolve()
        })
      })
    })

    it("protected packages cannot be accessed without the required permission group", async () => {
      user = createTestUser()
      pkg = createTestPackage({
        access: ["does-not-actually-matter"],
        publish: ["does-not-actually-matter"],
        unpublish: ["required-group"],
      })

      await new Promise<void>((resolve) => {
        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          resolve()
        })
      })
    })

    it("protected packages can be accessed with the required permission group", async () => {
      mockCache.getGroups = vi.fn().mockResolvedValue(["required-group"])
      user = createTestUser()
      pkg = createTestPackage({
        access: ["does-not-actually-matter"],
        publish: ["does-not-actually-matter"],
        unpublish: ["required-group"],
      })

      await new Promise<void>((resolve) => {
        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          resolve()
        })
      })
    })

    it("does not return `granted` status when `unpublish` is set up to fall back to `publish`", async () => {
      mockCache.getGroups = vi.fn().mockResolvedValue(["required-group"])
      user = createTestUser()
      pkg = createTestPackage({
        access: ["does-not-actually-matter"],
        publish: ["does-not-actually-matter"],
        unpublish: false,
      })

      await new Promise<void>((resolve) => {
        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBeUndefined()
          resolve()
        })
      })
    })
  })
})
