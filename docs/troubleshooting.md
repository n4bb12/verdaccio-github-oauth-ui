## Troubleshooting

1. [Troubleshooting](#troubleshooting)
   1. [Error: "verdaccio-github-oauth-ui plugin not found"](#error-verdaccio-github-oauth-ui-plugin-not-found)
   2. [Error: "Failed requesting GitHub user info"](#error-failed-requesting-github-user-info)
   3. [Error: "npm ERR! Unable to authenticate, your authentication token seems to be invalid." or "error--- undefined is forbidden publish for"](#error-npm-err-unable-to-authenticate-your-authentication-token-seems-to-be-invalid-or-error----undefined-is-forbidden-publish-for)

### Error: "verdaccio-github-oauth-ui plugin not found"

Avoid using a global installation of Verdaccio. Despite what Verdaccio examples
or documentation suggest, globally installed plugins may not work.

Verdaccio loads plugins by requiring them from various locations. Global
`node_modules` are NOT included in this search because they are NOT part of the
Node.js resolve algorithm. See
[#13](https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/13#issuecomment-435296117)
for more info.

Solutions that worked for others:

- Add your global `node_modules` folder to the `NODE_PATH` environment variable.
  This hints to Node.js where else to search in addition to default locations.
- Create a `package.json` and install Verdaccio + plugins locally.
- If you are using npm, try using yarn (only tested with classic). It installs
  or resolves modules differently such that globally installed plugins are
  found.
- Extend the official Docker image. It uses a local Verdaccio installation by
  default.

### Error: "Failed requesting GitHub user info"

- Double-check that your configured client id and client secret are correct.
- You might be using this plugin in combination with another auth plugin that
  allows users to register without having a corresponding GitHub account.
- If you are behind a proxy, make sure you are also passing through the query
  parameters to Verdaccio. See
  [#47](https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/47#issuecomment-643814163)
  for an example using `nginx`.

### Error: "npm ERR! Unable to authenticate, your authentication token seems to be invalid." or "error--- undefined is forbidden publish for"

You can run into this problem if you're using Verdaccio's legacy token
encryption of Verdaccio (which is inconveniently the default).

In that case, if authentication succeeds but the user does not have any groups,
the user is treated as anonymous.

This is different from how Verdaccio acts when using JWT API security. In that
case, the user does not need to have any groups as long as authentication
succeeds.

For more context, please see:

- https://verdaccio.org/docs/configuration/#security
- https://verdaccio.org/blog/2019/04/19/diving-into-jwt-support-for-verdaccio-4/
- https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/164
