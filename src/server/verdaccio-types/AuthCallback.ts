/**
 * https://verdaccio.org/docs/en/dev-plugins#callback
 */
export type AuthCallback = (error: string | null, groups: string[] | false) => void
