# verdaccio-github-oauth-ui

## About

A [verdaccio plugin](https://verdaccio.org/docs/en/plugins) that uses GitHub OAuth.

When clicking the login button, instead of filling in a login form, you are asked to log in with GitHub.

After successful login, the necessary `npm config` commands are shown at the top. You can then run `npm whoami --registry REGISTRY_URL` and start publishing packages.

The plugin is similar to [verdaccio-github-oauth](https://github.com/aroundus-inc/verdaccio-github-oauth) but also changes the UI login behaviour and there is no need to install a custom CLI to authenticate with the registry.

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

When creating the OAuth app at [github.com](https://github.com/settings/developers), use `REGISTRY_URL/-/oauth/callback` as the callback URL.

## License

MIT
