import { formatUsageInfo, init } from "./github-oauth-ui"

function updateUsageInfo() {
  const info = formatUsageInfo()
  const element = document.querySelector("[class*='header__headerWrap'] figure") as HTMLElement

  if (element) {
    element.innerText = info
  } else {
    setTimeout(updateUsageInfo, 0)
  }
}

init({
  loginButton: ".header-button-login",
  logoutButton: ".header-button-logout",
  updateUsageInfo,
})
