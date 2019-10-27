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

export function clearQueryParams() {
  history.replaceState(null, "", location.pathname)
}
