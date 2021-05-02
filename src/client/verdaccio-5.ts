import { getUsageInfo, init, isLoggedIn } from "./plugin"

const helpCardUsageInfoSelector = "#help-card .MuiCardContent-root span"
const dialogUsageInfoSelector =
  "#registryInfo--dialog-container .MuiDialogContent-root .MuiTypography-root span"
const randomClass = "Os1waV6BSoZQKfFwNlIwS"

// copied from here as it needs to be the same behaviour
// https://github.com/verdaccio/ui/blob/master/src/utils/cli-utils.ts
function copyToClipboard(text: string) {
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

function modifyUsageInfoNodes(
  selector: string,
  findPredicate: (node: HTMLElement) => boolean,
): void {
  const usageInfo = getUsageInfo()
  const loggedIn = isLoggedIn()

  const infoElements: NodeListOf<HTMLSpanElement> = document.querySelectorAll(
    selector,
  )
  const firstUsageInfoEl = Array.prototype.find.call(
    infoElements,
    findPredicate,
  )
  const hasInjectedElement = !!Array.prototype.find.call(
    infoElements,
    (node: HTMLElement) => node.parentElement!.classList.contains(randomClass),
  )

  // We can't find any element related to usage instructions,
  // or we have already injected elements
  if (!firstUsageInfoEl || hasInjectedElement) {
    return
  }

  const cachedParent: HTMLDivElement | null = firstUsageInfoEl.parentElement
  if (cachedParent) {
    usageInfo
      .split("\n")
      .reverse()
      .forEach((info) => {
        const clonedNode = cachedParent.cloneNode(true) as HTMLDivElement
        const textElem = clonedNode.querySelector("span")!
        const copyEl = clonedNode.querySelector("button")!

        clonedNode.classList.add(randomClass)
        textElem.innerText = info
        copyEl.style.visibility = loggedIn ? "visible" : "hidden"
        copyEl.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          copyToClipboard(info)
        }

        cachedParent.insertAdjacentElement("afterend", clonedNode)
      })
  }

  infoElements.forEach((node) => {
    if (
      // We only match lines related to bundler commands
      !!node.innerText.match(/^(npm|pnpm|yarn)/) &&
      // And only commands that we want to remove
      (node.innerText.includes("adduser") ||
        node.innerText.includes("set password"))
    ) {
      node.parentElement!.parentElement!.removeChild(node.parentElement!)
    }
  })
}

function updateUsageInfo() {
  modifyUsageInfoNodes(helpCardUsageInfoSelector, (node) =>
    node.innerText.includes("adduser"),
  )
  modifyUsageInfoNodes(
    dialogUsageInfoSelector,
    (node) =>
      !!node.innerText.match(
        // This checks for an element showing instructions to set the registry URL
        /((npm|pnpm) set|(yarn) config set)/,
      ),
  )
}

init({
  loginButton: `[data-testid="header--button-login"]`,
  logoutButton: `[data-testid="header--button-logout"]`,
  updateUsageInfo,
})
