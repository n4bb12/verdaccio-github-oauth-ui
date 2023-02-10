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

- Click the login button. You get redirected to Google
- Once completed, you'll be redirected back to Verdaccio.
- You are now logged in 🎉.

### On the Command Line

#### Option A) Using the Built-In CLI

The easiest way to configure npm is to use this short command:

```bash
npx verdaccio-google-oauth-ui-2 --registry http://localhost:4873
```

On success you should see this page in your browser:

<img src="screenshots/all-done.png" width="208" />

#### Option B) Using the Commands from the UI

- Verdaccio 5:

Open the "Configuration" dialog and click "Copy to clipboard":

<img src="screenshots/configuration-dialog.png" width="450" />

- Run the copied commands on your terminal:

```bash
npm config set //localhost:4873/:_authToken "SECRET_TOKEN"
```

- Verify npm is set up correctly by running the `whoami` command:

```bash
npm whoami --registry http://localhost:4873
```

If you see your Google username, you are ready to start installing and
publishing packages.

## Signing Out

### On the Verdaccio UI

Click the <kbd>Logout</kbd> button as per usual.

### On the Command Line

Unless OAuth access is revoked in the Google settings, the token is valid
indefinitely.
