import { AllowAccess, RemoteUser } from "@verdaccio/types"
import { PackageAccess } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestAuthProvider,
  createTestPackage,
  createTestPlugin,
  createTestUser,
} from "test/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("src/server/github/AuthProvider", () => ({
  GitHubAuthProvider: vi
    .fn()
    .mockImplementation(() => createTestAuthProvider()),
}))

describe("Plugin", () => {
  describe("allow_access", () => {
    let plugin: Plugin
    let user: RemoteUser
    let pkg: AllowAccess & PackageAccess

    describe("allow_access", () => {
      beforeEach(() => {
        plugin = createTestPlugin()
      })

      it("unprotected packages can be accessed without any permission groups", async () => {
        user = createTestUser([])
        pkg = createTestPackage({})

        await new Promise<void>((resolve) => {
          plugin.allow_access(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })

      it("protected packages cannot be accessed without the required permission group", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_access(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })

      it("protected packages can be accessed with the required permission group", async () => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ access: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_access(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })
    })
  })
})
