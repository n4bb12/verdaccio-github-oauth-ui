<h1 align="center">
  📦🔐 Verdaccio GitLab OAuth UI
</h1>

<p align="center">
  A GitLab OAuth Plugin for Verdaccio – <a href="https://www.verdaccio.org">https://www.verdaccio.org</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@bizneo/verdaccio-gitlab-oauth-ui">
    <img alt="Version" src="https://flat.badgen.net/npm/v/@bizneo/verdaccio-gitlab-oauth-ui?icon=npm">
  </a>
  <a href="https://raw.githubusercontent.com/bizneo/verdaccio-gitlab-oauth-ui/master/LICENSE">
    <img alt="License" src="https://flat.badgen.net/github/license/bizneo/verdaccio-gitlab-oauth-ui?icon=github">
  </a>
  <a href="https://github.com/bizneo/verdaccio-gitlab-oauth-ui/issues/new/choose">
    <img alt="Issues" src="https://flat.badgen.net/badge/github/create issue/pink?icon=github">
  </a>
</p>

## About

The plugin is similar to [verdaccio-github-oauth-ui](https://github.com/n4bb12/verdaccio-github-oauth-ui), but adapted to use GitLab APIs. When clicking the login button, instead of filling in a login form, you are asked to log in with itLab.

In case you need CLI support for automation purposes, the plugin is also compatible with it, adapting the functionality from [sinopia-github-oauth-cli](https://github.com/soundtrackyourbrand/sinopia-github-oauth-cli) to work with GitLab.

### Compatibility

- Verdaccio 3 and 4
- Node >=10
- Chrome, Firefox, Firefox ESR, Edge, Safari, IE 11

## Setup Instructions

### Install

```
$ npm install @bizneo/verdaccio-gitlab-oauth-ui
```

### GitLab Config

- Create an OAuth app at https://gitlab.com/profile/applications
- The callback URL should be `YOUR_REGISTRY_URL/-/oauth/callback`
- The scope needed is `openid`

### Verdaccio Config

Merge the below options with your existing Verdaccio config:

```yml
middlewares:
  gitlab-oauth-ui:
    enabled: true

auth:
  gitlab-oauth-ui:
    group: GITLAB_GROUP_PATH
    client-id: GITLAB_CLIENT_ID
    client-secret: GITLAB_CLIENT_SECRET
    gitlab-host: https://your-selfhosted-gitlab.com # Optional, default points to gitlab.com

url_prefix: YOUR_REGISTRY_URL
```

- The configured values can either be the actual value or the name of an environment variable that contains the value.
- The config props can be specified under either the `middlewares` or the `auth` node. Just make sure, the addon is included under both nodes.

#### `group`

Users within this group will be able to authenticate.

#### `client-id` and `client-secret`

These values can be obtained from GitLab OAuth app page at https://gitlab.com/profile/applications.

#### `gitlab-host` (optional)

Set this if you are using self-hosted GitLab. Example: `https://hostname`

#### `url_prefix` (optional)

If configured, it must match `YOUR_REGISTRY_URL`. See [GitLab Config](#GitLab-Config).

### Proxy Agent

If you are behind a proxy server, the plugin needs to know the proxy server in order to make GitLab requests.

Configure the below environment variable.

```
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
```

See the [global-agent](https://github.com/gajus/global-agent#environment-variables) docs for detailed configuration instrcutions.

## Login

### Verdaccio UI

- Click the login button and login via GitLab, if not logged in already.
- Authorize the registry - this needs to be done only once.
- After authorizing the registry with GitLab, you'll be redirected back to the Verdaccio registry.

You are now logged in.

### Command Line

To set up authentication with the registry in your npm CLI, you'll need to run the commands shown on the UI.

- Verdaccio 4: open the "Register Info" dialog and klick "Copy to clipboard"
- Verdaccio 3: Select the text in the header and copy it. In case the text is too long, you can double-click it. The invisible part will still be selected and copied.
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

If you see your GitLab username, you are ready to start publishing packages.

## Logout

### Verdaccio UI

Click the <kbd>Logout</kbd> button as per usual.

### Command Line

Unless OAuth access is revoked in the GitLab settings, the token is valid indefinitely.
