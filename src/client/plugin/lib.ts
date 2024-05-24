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

// This parseJWT implementation is taken from https://stackoverflow.com/a/38552302/1935971
export function parseJwt(token: string) {
  // JWT has 3 parts separated by ".", the payload is the base64url-encoded part in the middle
  const base64Url = token.split(".")[1]
  // base64url replaced '+' and '/' with '-' and '_', so we undo it here
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      // atob decoded the base64 string, but multi-byte characters (emojis for example)
      // are not decoded properly. For example, "🍀" looks like "ð\x9F\x8D\x80". The next
      // line converts bytes into URI-percent-encoded format, for example "%20" for space.
      // Lastly, the decodeURIComponent wrapping this can correctly get a UTF-8 string.
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )

  return JSON.parse(jsonPayload)
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
