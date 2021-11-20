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

- The Verdaccio login button redirects you to GitHub. If you have access, you return as a logged-in user. Logout works, too.
- The Verdaccio usage info is updated including copy-to-clipboard. 
- Use the built-in command line tool for quick and easy npm configuration.
- Use GitHub organizations, teams, or repositories to configure permissions.

### Compatibility

- Verdaccio 5
- Node 14, 16
- Chrome, Firefox, Firefox ESR, Edge, Safari

If you would like to use this with Verdaccio 3-4, Node.js 10-13, or IE you can use version 2 of the plugin.

## Setup

### Install

```
$ npm install verdaccio-github-oauth-ui
```

### GitHub Config

- Create an OAuth app at https://github.com/settings/developers
- The callback URL should be `YOUR_REGISTRY_URL/-/oauth/callback`

Example:

![](screenshots/github-app.png)

### Verdaccio Config

Merge the below options with your existing Verdaccio config:

```yml
middlewares:
  github-oauth-ui:
    enabled: true

auth:
  github-oauth-ui:
    org: GITHUB_ORG # (required)
    client-id: GITHUB_CLIENT_ID # (required)
    client-secret: GITHUB_CLIENT_SECRET # (required)
    enterprise-origin: GITHUB_ENTERPRISE_ORIGIN # (optional)
```

#### Notes

- The plugin options can be actual values or the names of environment variables containing the values.
- The plugin options can be specified under either the `middlewares` or the `auth` node.
- The plugin name must be included under both `middlewares` and `auth` nodes.

#### `org` (required)

Members of this org will be able to authenticate.

#### `client-id` and `client-secret` (required)

These values can be obtained from GitHub OAuth app page at https://github.com/settings/developers.

#### `enterprise-origin` (optional)

Set this if you are using GitHub Enterprise. Example: `https://github.example.com`

### Package Access

The following groups are added during login and can be used to configure package permissions:

- `$authenticated`
- `github/GITHUB_ORG` for every GitHub org the user is a member of
- `github/GITHUB_ORG/team/GITHUB_TEAM` for every GitHub team the user is a member of
- `github/GITHUB_ORG/repo/GITHUB_REPO` for every GitHub repository the user has access to

You can use these groups as shown below:

```yml
packages:
  foo:
    # limit actions to logged-in users (works in combination with other plugins such as htpasswd)
    access: $authenticated

    # limit actions to org members
    publish: github/GITHUB_ORG

    # limit actions to team members
    unpublish: github/GITHUB_ORG/team/GITHUB_TEAM
  bar:
    # limit actions to repository members (including outside collaborators)
    access: github/GITHUB_ORG/repo/GITHUB_REPO
```

See [Package Access](https://verdaccio.org/docs/en/packages) for more examples.

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

- Verdaccio 5:

Open the "Register Info" dialog and klick "Copy to clipboard":

![](screenshots/register-info.png)

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

If your GitHub org is private, the org membership visibility might be restrigted. If this is the case, your org members need to grant `read:org` permission during login.

They can request this during fist login by clicking the <kbd>Request</kbd> or <kbd>Grant</kbd> button when prompted to authorize Verdaccio with GitHub.

If you or a team member accidentally skipped this step, go to https://github.com/settings/applications, find your Verdaccio registry and grant `read:org` access from there.
