/**
 * Returns cookies as an object
 */
export function parseCookies(cookieStr: string) {
  return cookieStr
    .split(";")
    .filter((str) => str.includes("="))
    .map((str) => str.split("="))
    .reduce(
      (result, [key, value]) => ({
        ...result,
        [decodeURIComponent(key.trim())]: decodeURIComponent(value.trim()),
      }),
      {},
    )
}

export function retry(action: () => void) {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => action(), 100 * i)
  }
}

function pathContainsElement(selector: string, e: MouseEvent): boolean {
  const path = e.path || e.composedPath?.()
  const element = document.querySelector(selector)!

  return path.includes(element)
}

export function interruptClick(selector: string, callback: () => void) {
  const handleClick = (e: MouseEvent) => {
    if (pathContainsElement(selector, e)) {
      e.preventDefault()
      e.stopPropagation()
      callback()
    }
  }
  const capture = true
  document.addEventListener("click", handleClick, capture)
}
