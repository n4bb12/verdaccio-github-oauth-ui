import { getUsageInfo, init, isLoggedIn } from "./plugin"

const usageInfoSelector = "#help-card .MuiCardContent-root span, .MuiDialogContent-root .MuiTypography-root span"

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

function modifyUsageInfoNodes() {
  const usageInfo = getUsageInfo()
  const loggedIn = isLoggedIn()

  const infoElements = document.querySelectorAll(usageInfoSelector)
  let packageManager: "npm" | "pnpm" | "yarn" | undefined
  const cachedParent = Array.prototype.find.call(infoElements, node => {
    const match = node.innerText.match(
      // This checks for an element showing instructions to set the registry URL
      /((npm|pnpm) set|(yarn) config set)/,
    )
    // When it matches, it can either be:
    // 1. The second capture group: npm/pnpm
    // 2. The third capture group: yarn
    packageManager = match ? (match[1] || match[2]) : undefined
    return !!match
  }).parentElement as HTMLDivElement

  infoElements.forEach((node => {
    const infoEl = node as HTMLSpanElement
    if (
      // We only match lines related to bundler commands
      infoEl.innerText.match(/^(npm|pnpm|yarn)/) &&
      // And only commands that are shown in the popup overlay, to prevent overriding the help box
      (infoEl.innerText.includes("adduser") || infoEl.innerText.includes("set password"))
    ) {
      infoEl.parentElement!.parentElement!.removeChild(node.parentElement as HTMLDivElement)
    }
  }))

  if (cachedParent) {
    usageInfo.split("\n").forEach(info => {
      const clonedNode = cachedParent.cloneNode(true) as HTMLDivElement
      const textElem = clonedNode.querySelector("span") as HTMLSpanElement
      const copyEl = clonedNode.querySelector("button") as HTMLButtonElement

      // If cachedParent is defined, packageManager should be defined
      textElem.innerText = packageManager ? info.replace(/^npm/, packageManager) : info

      copyEl.style.visibility = loggedIn ? "visible" : "hidden"
      copyEl.onclick = e => {
        e.preventDefault()
        e.stopPropagation()
        copyToClipboard(info)
      }
    })
  }
}

function updateUsageInfo() {
  modifyUsageInfoNodes()
}

init({
  loginButton: "#header--button-login",
  logoutButton: "#header--button-logout",
  updateUsageInfo,
})
