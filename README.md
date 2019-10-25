<h1 align="center">
  📦🔐 Verdaccio GitHub OAuth UI
</h1>

<p align="center">
  A GitHub OAuth Plugin for Verdaccio – <a href="https://www.verdaccio.org">https://www.verdaccio.org</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/verdaccio-github-oauth-ui">
    <img alt="Version" src="https://flat.badgen.net/npm/v/verdaccio-github-oauth-ui?icon=npm">
  </a>
  <a href="https://raw.githubusercontent.com/n4bb12/verdaccio-github-oauth-ui/master/LICENSE">
    <img alt="License" src="https://flat.badgen.net/github/license/n4bb12/verdaccio-github-oauth-ui?icon=github">
  </a>
  <a href="https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/new/choose">
    <img alt="Issues" src="https://flat.badgen.net/badge/github/create issue/pink?icon=github">
  </a>
  <a href="https://circleci.com/gh/n4bb12/workflows/verdaccio-github-oauth-ui">
    <img alt="CircleCI" src="https://flat.badgen.net/circleci/github/n4bb12/verdaccio-github-oauth-ui/master?icon=circleci">
  </a>
  <a href="https://david-dm.org/n4bb12/verdaccio-github-oauth-ui">
    <img alt="Dependencies" src="https://flat.badgen.net/david/dep/n4bb12/verdaccio-github-oauth-ui?icon=npm">
  </a>
  <a href="https://lgtm.com/projects/g/n4bb12/verdaccio-github-oauth-ui/alerts">
    <img alt="LGTM" src="https://flat.badgen.net/lgtm/alerts/g/n4bb12/verdaccio-github-oauth-ui?icon=lgtm">
  </a>
</p>

## About

<img src="screenshots/authorize.png" align="right" width="270"/>

The plugin is similar to [verdaccio-github-oauth](https://github.com/aroundus-inc/verdaccio-github-oauth), but also changes the UI login behaviour. When clicking the login button, instead of filling in a login form, you are asked to log in with GitHub.

In case you need CLI support for automation purposes, the plugin is also compatible with [sinopia-github-oauth-cli](https://github.com/soundtrackyourbrand/sinopia-github-oauth-cli).

## Install

```
$ npm install verdaccio-github-oauth-ui
```

#### Compatibility

- This plugin is currently only compatible with Verdaccio 3.x.
- This plugin supports Node versions 6.5.x - 10.x.x

## Configuration

#### Verdaccio Config

Merge the below options with your existing Verdaccio configuration:

```yml
middlewares:
  github-oauth-ui:
    enabled: true

auth:
  github-oauth-ui:
    org: $GITHUB_OAUTH_ORG # required, people within this org will be able to authenticate
    client-id: $GITHUB_OAUTH_CLIENT_ID # required
    client-secret: $GITHUB_OAUTH_CLIENT_SECRET # required
    github-enterprise-hostname: $GITHUB_OAUTH_GITHUB_ENTERPRISE_HOSTNAME # optional, set this if you are using github enterprise
```

The configured values can be either a value or the name of an environment variable that contains the value.

#### GitHub Config

When creating the OAuth app at [https://github.com/settings/developers](https://github.com/settings/developers), the callback URL should be:

```
YOUR_REGISTRY_URL/-/oauth/callback
```

If `url_prefix` is specified in the Verdaccio config then it must match the `YOUR_REGISTRY_URL`.

## How to Login

#### Verdaccio

Click the login button and login at GitHub, if not already logged in.

Authorize the registry.
**Important**: When using a private GitHub org, make sure to click the <kbd>Request</kbd> button for `read:org` access. See [#5](https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/5#issuecomment-417371679).

After successful login and authorization, you're redirected back to the verdaccio registry.

#### Command Line

To set up authentication with the registry in your npm CLI, you'll need to run the commands shown in the header:

![](screenshots/header.png)

To verify that the authentication token is set up correctly, run the following command:

```
$ npm whoami --registry YOUR_REGISTRY_URL
n4bb12
```

If you see your **GitHub username**, you are ready to start publishing packages.

Unless the token is revoked by you in the GitHub settings, it never expires.
