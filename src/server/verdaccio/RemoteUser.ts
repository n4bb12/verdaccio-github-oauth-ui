export interface RemoteUser {
  real_groups: string[]
  groups: string[]
  name: string | void
  error?: string
}
