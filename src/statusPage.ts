import { pluginName } from "./constants"

export function buildStatusPage(body: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${pluginName}</title>
    <style>
      html,
      body {
        padding: 0;
        margin: 0;
        height: 100%;
        background-color: #e0e0e0;
        color: #24292F;
        font-family: Helvetica, sans-serif;
        position: relative;
        text-align: center;
      }
      .wrap {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      a {
        color: #3f51b5;
      }
      img {
        filter: drop-shadow(0 0.5rem 0.5rem #24292F80);
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img src="https://verdaccio.org/docs/assets/logo/symbol/svg/verdaccio-blackwhite.svg" alt="verdaccio-blackwhite.svg" />
      ${body}
    </div>
  </body>
</html>`
}

export function buildErrorPage(error: any) {
  return buildStatusPage(`
    <h1>Sorry :(</h1>
    <p>${error?.message || error}</p>
    <p><a href="/">Go back</a></p>
  `)
}

export const accessDeniedPage = buildStatusPage(`
  <h1>Access Denied</h1>
  <p>You are not a member of the required org.</p>
  <p><a href="/">Go back</a></p>
`)
