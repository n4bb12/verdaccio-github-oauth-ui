# 🚀 Quick Start

## 1. Install

```bash
npm install verdaccio-github-oauth-ui
```

> ℹ️ See [Installation](installation.md) for more options.

## 2. Configure

Merge the below options with your existing Verdaccio config:

```yaml
middlewares:
  github-oauth-ui:
    enabled: true

auth:
  github-oauth-ui:
    client-id: GITHUB_CLIENT_ID
    client-secret: GITHUB_CLIENT_SECRET
    token: GITHUB_TOKEN
    enterprise-origin: GITHUB_ENTERPRISE_ORIGIN
```

> ℹ️ See [Configuration](configuration.md) for detailed instructions.

## 3. Login

Restart Verdaccio and click the login button!
