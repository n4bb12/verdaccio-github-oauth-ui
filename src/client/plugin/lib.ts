import qs from "query-string"

/**
 * Returns `?a=b&c` as `{ a: b, c: true }`.
 */
export function parseQueryParams() {
  return qs.parse(window.location.search || "?")
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
