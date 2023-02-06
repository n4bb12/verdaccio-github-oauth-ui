/**
 * https://developer.github.com/v3/users/#response-with-public-and-private-profile-information
 */
export interface GoogleUser {
  email: string
  given_name: string
  family_name: string
  name: string
}
