interface Window {
  VERDACCIO_API_URL?: string
}

interface MouseEvent {
  // IE and Edge have a `path` property instead of `composedPath()`.
  // https://caniuse.com/#feat=mdn-api_event_composedpath
  path?: Element[]
}
