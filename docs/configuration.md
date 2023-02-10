# Configuration

1. [Installing the Plugin](#installing-the-plugin)
   1. [Installing It Locally](#installing-it-locally)
   2. [Extending the Verdaccio Docker Image](#extending-the-verdaccio-docker-image)
   3. [Global Installation](#global-installation)
2. [Registering a Google OAuth Application](#registering-a-google-oauth-application)
3. [Configuring Verdaccio](#configuring-verdaccio)
   1. [`client-id` and `client-secret` (required, string)](#client-id-and-client-secret-required-string)
   2. [`domain` (optional, string)](#domain-optional-string)
   3. [`group-config` (optional, GroupConfig)](#group-config-optional-GroupConfig)
   4. [API Security](#api-security)
   5. [Using Environment Variables](#using-environment-variables)
4. [Configuring Package Access](#configuring-package-access)
5. [Configuring a Proxy](#configuring-a-proxy)

### Compatibility

- Verdaccio 5.0 - 5.20.1
- Node 16
- npm 7+
- Browsers: See [browserslist](../.browserslistrc)

## Installing the Plugin

Some recommended ways to install the plugin:

### Installing It Locally

```bash
npm install verdaccio-google-oauth-ui-2
```

### Extending the Verdaccio Docker Image

See the [Dockerfile](../Dockerfile) for a simple example.

Verdaccio also has various [Docker
examples](https://github.com/verdaccio/verdaccio/tree/master/docker-examples).

### Global Installation

Avoid installing plugins globally, it is likely to cause problems (in general,
not just this plugin). See the
[troubleshooting](./troubleshooting.md#error-verdaccio-github-oauth-ui-plugin-not-found)
guide for more information on alternatives.

## Registering a Google OAuth Application

- Register a new OAuth application with [Google](https://support.google.com/cloud/answer/6158849?hl=en)
- The callback URLs should be `YOUR_REGISTRY_URL/-/oauth/callback` and `YOUR_REGISTRY_URL/-/oauth/callback/cli`

## Configuring Verdaccio

Merge the below options with your existing Verdaccio config:

```yml
middlewares:
  google-oauth-ui-2:
    enabled: true

auth:
  google-oauth-ui-2:
    client-id: GOOGLE_CLIENT_ID
    client-secret: GOOGLE_CLIENT_SECRET
    domain: GOOGLE_DOMAIN
    group-config:
      key-info: GOOGLE_KEY_INFO
      impersonate-account: GOOGLE_ADMIN_ACCOUNT
      allowed-groups:
        - verdaccio
```

### `client-id` and `client-secret` (required, string)

These values are used to perform OAuth authorization code flows on behalf of
your Google OAuth app.

You can find these values on the settings page of the GitHub app you previously
created.

### `domain` (optional, string)

The domain that's allowed to login

OPTIONAL The hd (hosted domain) parameter streamlines the login process for G Suite hosted accounts. By including the domain of the G Suite user (for example, mycollege.edu), you can indicate that the account selection UI should be optimized for accounts at that domain.

### `group-config` (optional, GroupConfig)
Provides ability to use groups from Google Workspace.  Requires a Service Account and admin user to impersonate

- `key-info` (required, string): Service Account JSON credentials which can be the file path or a JSON string
- `impersonate-account` (required, string): Google Workspace account with permissions for Groups Reader
- `allowed-groups` (optional, list): groups which are allowed to successfully authenticate to Verdaccio

### API Security

This plugin doesn't support Verdaccio's legacy token encryption. Please use
the newer JWT configuration. See the corresponding [Verdaccio
docs](https://verdaccio.org/docs/configuration/#security) for instructions on
how to configure it.

### Using Environment Variables

The plugin options can be actual values or the names of environment variables
containing the values.

For example, either of the below will work:

- `client-id: abc`
- `client-id: GOOGLE_CLIENT_ID` and set an environment variable
  `GOOGLE_CLIENT_ID=abc`.

The environment variable names can be chosen freely. These are just examples.

## Configuring Package Access

The following groups can be used to configure package permissions (access,
publish, unpublish) as shown below:

```yml
packages:
  package1:
    # Limit access to signed-in users.
    # This works in tandem with other plugins that also add the `$authenticated` group, such as `htpasswd`.
    # If you want to limit access, use one of the other
    access: $authenticated

  package2:
    # Limit access to Google groups:
    access: "verdaccio-access"
```

See [Package Access](https://verdaccio.org/docs/en/packages) for more examples.

## Configuring a Proxy

If you are behind a proxy, the plugin needs to know the proxy server URL to make
requests to the GitHub API. You can do that by configuring
[global-agent](https://github.com/gajus/global-agent) environment variables:

```bash
export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
```

See the
[global-agent](https://github.com/gajus/global-agent#environment-variables) docs
for detailed configuration instrcutions.
