# Usage

1. [Login](#login)
   1. [On the Verdaccio UI](#on-the-verdaccio-ui)
   2. [On the Command Line](#on-the-command-line)
      1. [Option A) Using the Built-In CLI](#option-a-using-the-built-in-cli)
      2. [Option B) Using the Commands from the UI](#option-b-using-the-commands-from-the-ui)
2. [Signing Out](#signing-out)
   1. [On the Verdaccio UI](#on-the-verdaccio-ui-1)
   2. [On the Command Line](#on-the-command-line-1)

## Login

### On the Verdaccio UI

<img src="screenshots/authorize.png" width="398" />

- Click the login button. You get redirected to GitHub and prompted to authorize
  the registry to access your public information.
- If the registry requires private org membership, click the <kbd>Request</kbd>
  or <kbd>Grant</kbd> button next to the org to get `read:org` access to the
  registry.
- Authorize the registry to access your GitHub user and org info. You only need
  to do this once.
- Once completed, you'll be redirected back to Verdaccio.
- You are now logged in 🎉.

### On the Command Line

#### Option A) Using the Built-In CLI

The easiest way to configure npm is to use this short command:

```bash
npx verdaccio-github-oauth-ui --registry http://localhost:4873
```

On success you should see this page in your browser:

<img src="screenshots/all-done.png" width="208" />

#### Option B) Using the Commands from the UI

- Verdaccio 5:

Open the "Configuration" dialog and click "Copy to clipboard":

<img src="screenshots/configuration-dialog.png" width="450" />

- Run the copied commands on your terminal:

```bash
npm config set //localhost:4873/:always-auth true
npm config set //localhost:4873/:_authToken "SECRET_TOKEN"
```

- Verify npm is set up correctly by running the `whoami` command:

```bash
npm whoami --registry http://localhost:4873
```

If you see your GitHub username, you are ready to start installing and
publishing packages.

## Signing Out

### On the Verdaccio UI

Click the <kbd>Logout</kbd> button as per usual.

### On the Command Line

Unless OAuth access is revoked in the GitHub settings, the token is valid
indefinitely.
