import { pluginName } from "../server/plugin/Config"
import { npmConfig } from "./npm"

export const successPage = `<!DOCTYPE html>
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
      img {
        filter: drop-shadow(0 0.5rem 0.5rem #24292F80);
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img src="https://verdaccio.org/docs/assets/logo/symbol/svg/verdaccio-blackwhite.svg" alt="verdaccio-blackwhite.svg" />
      <h1>All done!</h1>
      <p>We've updated your npm configuration.</p>
      <p><code>${npmConfig.userconfig}</code></p>
    </div>
  </body>
</html>
`
