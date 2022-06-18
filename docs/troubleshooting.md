## Troubleshooting

1. [Troubleshooting](#troubleshooting)
   1. [Error: "verdaccio-github-oauth-ui plugin not found"](#error-verdaccio-github-oauth-ui-plugin-not-found)
   2. [Error: "Failed requesting GitHub user info"](#error-failed-requesting-github-user-info)

### Error: "verdaccio-github-oauth-ui plugin not found"

Avoid using a global installation of Verdaccio. Despite what Verdaccio examples
or documentation suggest, globally installed plugins may not work.

Verdaccio loads plugins by requiring them from various locations.
Global `node_modules` are NOT included in this search because they are NOT part
of the Node.js resolve algorithm. See
[#13](https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/13#issuecomment-435296117)
for more info.

Solutions that worked for others:

- Add your global `node_modules` folder to the `NODE_PATH` environment variable.
  This hints to Node.js where else to search in addition to default locations.
- Create a `package.json` and install Verdaccio + plugins locally.
- If you are using npm, try using yarn (only tested with classic).
  It installs or resolves modules differently such that globally installed plugins are found.
- Extend the official Docker image. It uses a local Verdaccio installation by default.

### Error: "Failed requesting GitHub user info"

- Double-check that your configured client id and client secret are correct.
- If you are behind a proxy, make sure you are also passing through the query
  parameters to Verdaccio. See
  [#47](https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/47#issuecomment-643814163)
  for an example using `nginx`.
