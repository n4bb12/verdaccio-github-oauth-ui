import { getUsageInfo, init, isLoggedIn } from "./plugin"

const usageInfoSelector = "#help-card .MuiCardContent-root span, .MuiDialogContent-root .MuiTypography-root span"
const randomId = "Os1waV6BSoZQKfFwNlIwS"

// copied from here as it needs to be the same behaviour
// https://github.com/verdaccio/ui/blob/master/src/utils/cli-utils.ts
export function copyToClipboard(text: string) {
  const node = document.createElement("div")
  node.innerText = text
  document.body.appendChild(node)
  const range = document.createRange()
  const selection = window.getSelection() as Selection
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
  document.execCommand("copy")
  document.body.removeChild(node)
}

function markUsageInfoNodes() {
  document.querySelectorAll(usageInfoSelector).forEach(node => {
    const infoEl = node as HTMLSpanElement

    if (infoEl.innerText.includes("adduser")) {
      infoEl.classList.add(randomId)
    }
  })
}

function modifyUsageInfoNodes() {
  const usageInfo = getUsageInfo()
  const loggedIn = isLoggedIn()

  document.querySelectorAll("." + randomId).forEach(node => {
    const infoEl = node as HTMLSpanElement
    const parentEl = infoEl.parentElement as HTMLDivElement
    const copyEl = parentEl.querySelector("button") as HTMLButtonElement

    infoEl.innerText = usageInfo

    copyEl.style.visibility = loggedIn ? "visible" : "hidden"
    copyEl.onclick = e => {
      e.preventDefault()
      e.stopPropagation()
      copyToClipboard(usageInfo)
    }
  })
}

function updateUsageInfo() {
  markUsageInfoNodes()
  modifyUsageInfoNodes()
}

init({
  loginButton: "#header--button-login",
  logoutButton: "#header--button-logout",
  updateUsageInfo,
})
