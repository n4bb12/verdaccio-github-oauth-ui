<h1 align="center">
  📦🔐 Verdaccio GitHub OAuth UI
</h1>

<p align="center">
  A GitHub OAuth Plugin for Verdaccio – <a href="https://www.verdaccio.org">https://www.verdaccio.org</a>
</p>

<p align="center">
  <a href="https://circleci.com/gh/n4bb12/workflows/verdaccio-github-oauth-ui">
    <img alt="CircleCI" src="https://flat.badgen.net/circleci/github/n4bb12/verdaccio-github-oauth-ui?icon=circleci">
  </a>
  <a href="https://lgtm.com/projects/g/n4bb12/verdaccio-github-oauth-ui/alerts">
    <img alt="LGTM" src="https://flat.badgen.net/lgtm/alerts/g/n4bb12/verdaccio-github-oauth-ui?icon=lgtm">
  </a>
  <a href="https://david-dm.org/n4bb12/verdaccio-github-oauth-ui">
    <img alt="Dependencies" src="https://flat.badgen.net/david/dep/n4bb12/verdaccio-github-oauth-ui?icon=npm">
  </a>
  <a href="https://www.npmjs.com/package/verdaccio-github-oauth-ui">
    <img alt="Version" src="https://flat.badgen.net/npm/v/verdaccio-github-oauth-ui?icon=npm">
  </a>
  <a href="https://raw.githubusercontent.com/n4bb12/verdaccio-github-oauth-ui/master/LICENSE">
    <img alt="License" src="https://flat.badgen.net/github/license/n4bb12/verdaccio-github-oauth-ui?icon=github">
  </a>
  <a href="https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/new/choose">
    <img alt="Issues" src="https://flat.badgen.net/badge/github/create issue/pink?icon=github">
  </a>
</p>

## About

When clicking the login button, instead of filling in a login form, you are asked to log in with GitHub.

The plugin is similar to [verdaccio-github-oauth](https://github.com/aroundus-inc/verdaccio-github-oauth) but also changes the UI login behaviour.

In case you need CLI support for automation purposes, the plugin is also compatible with [sinopia-github-oauth-cli](https://github.com/soundtrackyourbrand/sinopia-github-oauth-cli).

## Install

```
$ npm install verdaccio-github-oauth-ui
```

## Configuration

The plugin requires the following additional configuration:

```yaml
middlewares:
  github-oauth-ui:
    client-id: $GITHUB_OAUTH_CLIENT_ID # required
    client-secret: $GITHUB_OAUTH_CLIENT_SECRET # required

auth:
  github-oauth-ui:
    org: $GITHUB_OAUTH_ORG # required, people within this org will be able to auth
```

The values for `client-id` and `client-secret` can either be an environment variable where the value is stored, or the value itself.

When creating the OAuth app at [github.com](https://github.com/settings/developers), use

```
REGISTRY_URL/-/oauth/callback
```

as the callback URL.

If `url_prefix` is specified in the config then it must be equal to the `REGISTRY_URL`.

## Usage

- Click the login button and follow the OAuth flow.

  *When using a private GitHub org, make sure to click the [Request] button for org read access. See [#5](https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/5#issuecomment-417371679).*

- After successful login, the npm config commands that set up authentication with the registry are shown at the top.

- To verify that the authentication token is set up correctly, run

  ```
  npm whoami --registry REGISTRY_URL
  ```

  If you see your GitHub username, you are ready to start publishing packages.

- Unless the token is revoked on GitHub, it is infinitely valid.
