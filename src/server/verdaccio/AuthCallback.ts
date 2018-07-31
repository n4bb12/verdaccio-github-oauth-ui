/**
 * https://verdaccio.org/docs/en/dev-plugins#callback
 */
export type AuthCallback = (error, groups: string[] | false) => void
