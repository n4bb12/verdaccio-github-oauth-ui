import { getUsageInfo, init } from "./plugin"

function updateUsageInfo() {
  const info = getUsageInfo()
  const element = document.querySelector("[class*='header__headerWrap'] figure") as HTMLElement

  if (element && element.innerText !== info) {
    element.innerText = info
  }
}

init({
  loginButton: ".header-button-login",
  logoutButton: ".header-button-logout",
  updateUsageInfo,
})
