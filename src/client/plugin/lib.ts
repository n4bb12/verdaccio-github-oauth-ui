/**
 * Returns `?a=b&c` as `{ a: b, c: true }`.
 */
export function parseQueryParams() {
  return (location.search || "?")
    .substring(1)
    .split("&")
    .filter(kv => kv)
    .map(kv => kv.split("=").concat(["true"]))
    .reduce((obj: any, pair) => {
      obj[pair[0]] = decodeURIComponent(pair[1])
      return obj
    }, {})
}

export function retry(action: () => void) {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => action(), 100 * i)
  }
}

function pathContainsElement(selector: string, e: MouseEvent): boolean {
  const path = e.path || (e.composedPath && e.composedPath())
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
