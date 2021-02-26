<h1 align="center">
  📦🔐 Verdaccio GitHub OAuth - With UI Support
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
</p>

## About

<img src="screenshots/authorize.png" align="right" width="270"/>

This is a Verdaccio plugin that offers GitHub OAuth integragtion for both the browser and the command line.

### Features

- UI integration with fully functional login and logout. When clicking the login button the user is redirected to GitHub and returns with a working session.
- Updated usage info and working copy-to-clipboard for setup commands. 
- A small CLI for quick-and-easy configuration.

### Compatibility

- Verdaccio 3 and 4
- Node >=10
- Chrome, Firefox, Firefox ESR, Edge, Safari, IE 11

## Setup

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
    enterprise-origin: GITHUB_ENTERPRISE_ORIGIN # optional, if you are using github enterprise
    team: GITHUB_TEAM # optional, to filter by team name

url_prefix: YOUR_REGISTRY_URL # optional, make sure it is configured as described
```

- The configured values can either be the actual value or the name of an environment variable that contains the value.
- The config props can be specified under either the `middlewares` or the `auth` node. Just make sure, the addon is included under both nodes.

#### `org`

Users within this org will be able to authenticate.

#### `client-id` and `client-secret`

These values can be obtained from GitHub OAuth app page at https://github.com/settings/developers.

#### `enterprise-origin` (optional)

Set this if you are using GitHub Enterprise. Example: `https://hostname`

#### `team` (optional)

Users within specified team will be able to authenticate

#### `url_prefix` (optional)

If configured, it must match `YOUR_REGISTRY_URL`. See [GitHub Config](#GitHub-Config).

### Proxy Config

If you are behind a proxy server, the plugin needs to know the proxy server in order to make GitHub requests.

Configure the below environment variable.

```
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
```

See the [global-agent](https://github.com/gajus/global-agent#environment-variables) docs for detailed configuration instrcutions.

## Login

### Verdaccio UI

- Click the login button and get redirected to GitHub.
- Authorize the registry to access your GitHub user and org info. You only need to do this once. If your org is private, make sure to click the <kbd>Request</kbd> or <kbd>Grant</kbd> button to get `read:org` access when prompted to authorize.
- Once completed, you'll be redirected back to the Verdaccio registry.

You are now logged in.

### Command Line

#### Option A) Use the built-in CLI

The easiest way to configure npm is to use this short command:

```
$ npx verdaccio-github-oauth-ui --registry http://localhost:4873
```

#### Option B) Copy commands from the UI

- Verdaccio 4:

Open the "Register Info" dialog and klick "Copy to clipboard":

![](screenshots/register-info.png)

- Verdaccio 3:

Select the text in the header and copy it. In case the text is too long, you can double-click it. The invisible part will still be selected and copied.

![](screenshots/header.png)

- Run the copied commands on your terminal:

```
$ npm config set //localhost:4873:_authToken "SECRET_TOKEN"
$ npm config set //localhost:4873:always-auth true
```

- Verify npm is set up correctly by running the `whoami` command. Example:

```
$ npm whoami --registry http://localhost:4873
n4bb12
```

If you see your GitHub username, you are ready to start installing and publishing packages.

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


## Troubleshooting

### "Failed requesting GitHub user info"

- Double-check your configured client id and client secret are correct.
- If you are behind a proxy, make sure you are also passing through the query parameters to Verdaccio, see https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/47#issuecomment-643814163 for an nginx example.

### Plugin not detected when installed globally

Verdaccio loads plugins by requiring them but global `node_modules` are NOT searched by the node resolve algorithm. Despite what examples or documentation might be suggesting, globally installed plugins are not supported. Some solutions that worked for others:

- If you are using npm, switch to yarn. yarn installs modules a bit differently, such that globally installed plugins are found.
- Create a `package.json` and install verdaccio + plugins locally.
- Add your global `node_modules` folder to the `NODE_PATH` environment variable to give node a hint to search for modules here, too.
- Extend the official docker image. See this `docker.sh` and `Dockerfile` in this [example](https://gist.github.com/n4bb12/523e8347a580f596cbf14d0d791b5927).

More info: https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/13#issuecomment-435296117

### "Your auth token is no longer valid. Please log in again."

- If you're using a private GitHub org, the org memberships might not be public. If this is the case, your org members need `read:org` permission. They can request this during fist login by clicking the <kbd>Request</kbd> or <kbd>Grant</kbd> button when prompted to authorize Verdaccio with GitHub. If you or a team member accidentally skipped this step, go to https://github.com/settings/applications, find your Verdaccio registry and grant `read:org` access from there.
