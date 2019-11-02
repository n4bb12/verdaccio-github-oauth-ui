import { PackageAccess, RemoteUser } from "@verdaccio/types"
import { Plugin } from "src/server/plugin/Plugin"

import {
  authenticated,
  createTestPlugin,
  testRequiredGroup,
  testUsername,
} from "../test-utils"

describe("Plugin", () => {
  describe("allow_access", () => {

    let plugin: Plugin

    beforeEach(() => {
      plugin = createTestPlugin()
    })

    it("unauthenticated user does not have access", (done) => {
      const user: RemoteUser = {
        real_groups: [],
        groups: [],
        name: testUsername,
      }
      const pkg: PackageAccess = {
        access: [authenticated],
      }

      plugin.allow_access(user, pkg, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
        done()
      })
    })

    it("authenticated user outside org does not have access", (done) => {
      const userGroups = [authenticated]
      const user: RemoteUser = {
        real_groups: userGroups,
        groups: userGroups,
        name: testUsername,
      }
      const pkg: PackageAccess = {
        access: [authenticated],
      }

      plugin.allow_access(user, pkg, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toBe(false)
        done()
      })
    })

    it("authenticated user in org has access", (done) => {
      const userGroups = [authenticated, testRequiredGroup]
      const user: RemoteUser = {
        real_groups: userGroups,
        groups: userGroups,
        name: testUsername,
      }
      const pkg: PackageAccess = {
        access: [authenticated],
      }

      plugin.allow_access(user, pkg, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual(userGroups)
        done()
      })
    })

    it("unauthenticated user has access if authentication is not required", (done) => {
      const user: RemoteUser = {
        real_groups: [],
        groups: [],
        name: testUsername,
      }
      const pkg: PackageAccess = {
        access: [],
      }

      plugin.allow_access(user, pkg, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual([])
        done()
      })
    })

    it("authenticated user has access if authentication is not required", (done) => {
      const user: RemoteUser = {
        real_groups: [authenticated],
        groups: [authenticated],
        name: testUsername,
      }
      const pkg: PackageAccess = {
        access: [],
      }

      plugin.allow_access(user, pkg, (err, groups) => {
        expect(err).toBeNull()
        expect(groups).toEqual([authenticated])
        done()
      })
    })

  })
})
