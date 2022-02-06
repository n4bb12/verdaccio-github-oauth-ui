import { pluginName } from "./constants"

const styles = `
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
.img {
  filter: drop-shadow(0 0.5rem 0.5rem #24292F80);
  width: 100px;
}
`
  .trim()
  .replace(/\s+/g, " ")

const logo = `<svg class="img" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><defs/><defs><filter id="a" width="139.6%" height="140.4%" x="-20%" y="-12%" filterUnits="objectBoundingBox"><feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1"/><feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2.5"/><feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"/><feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0906646286 0"/></filter><filter id="c" width="167.9%" height="272.7%" x="-34%" y="-50%" filterUnits="objectBoundingBox"><feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1"/><feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2.5"/><feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0906646286 0"/></filter><path id="b" d="M48 17L33 47h-9L0 0h15l13 25 5-8h15z"/><path id="d" d="M35 11h-7V9h8l2-3h-6V4h7l1-2h-4V0h20l-6 11H35z"/></defs><g fill="none" fill-rule="evenodd"><rect width="100" height="100" fill="#000" rx="37"/><g transform="translate(22 30)"><use fill="#000" filter="url(#a)" xlink:href="#b"/><use fill="#FFF" fill-opacity=".6" xlink:href="#b"/></g><g transform="translate(22 30)"><use fill="#000" filter="url(#c)" xlink:href="#d"/><use fill="#FFF" xlink:href="#d"/></g><path fill="#FFF" d="M55 77h-9L22 30h15l21 41z"/></g></svg>`

export function buildStatusPage(body: string, withBackButton: boolean) {
  const backButton = withBackButton
    ? `<p><button onclick="window.history.back()">Go back</button></p>`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${pluginName}</title>
    <style>${styles}</style>
  </head>
  <body>
    <div class="wrap">
      ${logo}
      ${body}
      ${backButton}
    </div>
  </body>
</html>`
}

export function buildErrorPage(error: any, withBackButton: boolean) {
  return buildStatusPage(
    `<h1>Sorry :(</h1>
    <p>${error?.message || error}</p>`,
    withBackButton,
  )
}

export function buildAccessDeniedPage(withBackButton: boolean) {
  return buildStatusPage(
    `<h1>Access Denied</h1>
    <p>You are not a member of the required access group.</p>`,
    withBackButton,
  )
}
