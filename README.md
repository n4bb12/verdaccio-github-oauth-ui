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

### Compatibility

- Verdaccio 3 and 4
- Node >=10
- Chrome, Firefox, Firefox ESR, Edge, Safari, IE 11

## Setup Instructions

### Install

```
$ npm install verdaccio-github-oauth-ui
```

### GitHub Config

- Create an OAuth app at https://github.com/settings/developers
- The callback URL should be `YOUR_REGISTRY_URL/-/oauth/callback`

![](screenshots/github-app.png)

### Verdaccio Config

Merge the below options with your existing Verdaccio config:

```yml
middlewares:
  github-oauth-ui:
    enabled: true

auth:
  github-oauth-ui:
    org: GITHUB_ORG
    client-id: GITHUB_CLIENT_ID
    client-secret: GITHUB_CLIENT_SECRET
    enterprise-origin: GITHUB_ENTERPRISE_ORIGIN

url_prefix: YOUR_REGISTRY_URL
```

- The configured values can either be the actual value or the name of an environment variable that contains the value.
- The config props can be specified under either the `middlewares` or the `auth` node. Just make sure, the addon is included under both nodes.

#### `org`

Users within this org will be able to authenticate.

#### `client-id` and `client-secret`

These values can be obtained from GitHub OAuth app page at https://github.com/settings/developers.

#### `enterprise-origin` (optional)

Set this if you are using GitHub Enterprise. Example: `https://hostname`

#### `url_prefix` (optional)

If configured, it must match `YOUR_REGISTRY_URL`. See [GitHub Config](#GitHub-Config).

### Proxy Agent

If you are behind a proxy server, the plugin needs to know the proxy server in order to make GitHub requests.

Configure the below environment variable.

```
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
```

See the [global-agent](https://github.com/gajus/global-agent#environment-variables) docs for detailed configuration instrcutions.

## Login

### Verdaccio UI

- Click the login button and login via GitHub, if not logged in already.
- Authorize the registry - this needs to be done only once.
- After authorizing the registry with GitHub, you'll be redirected back to the Verdaccio registry.

You are now logged in.

**Important**: Make sure to click the <kbd>Request</kbd> button for `read:org` access when prompted. If you accidentally skipped this step, go to https://github.com/settings/applications, find the Verdaccio registry and add `read:org` access from there.

### Command Line

To set up authentication with the registry in your npm CLI, you'll need to run the commands shown on the UI.

- Verdaccio 4: open the "Register Info" dialog and klick "Copy to clipboard":

![](screenshots/register-info.png)

- Verdaccio 3: Select the text in the header and copy it. In case the text is too long, you can double-click it. The invisible part will still be selected and copied.

![](screenshots/header.png)

- Run the copied commands on your terminal.

```
$ npm config set //localhost:4873:_authToken "SECRET_TOKEN"
$ npm config set //localhost:4873:always-auth true
```

- Verify npm is set up correctly by running the `whoami` command. Example:

```
$ npm whoami --registry http://localhost:4873
n4bb12
```

If you see your GitHub username, you are ready to start publishing packages.

## Logout

### Verdaccio UI

Click the <kbd>Logout</kbd> button as per usual.

### Command Line

Unless OAuth access is revoked in the GitHub settings, the token is valid indefinitely.

## Revoke Tokens

To invalidate your active login tokens you need to revoke access on the GitHub OAuth app:

- Go to https://github.com/settings/applications
- Find your Verdaccio app
- Click the <kbd>Revoke</kbd> button as shown below

![](screenshots/revoke.png)

If you have created the GitHub OAuth app, you can also revoke access for all users:

- Go to https://github.com/settings/applications
- Find your Verdaccio app
- Click the app name
- On the app detail page click the <kbd>Revoke all user tokens</kbd> button
