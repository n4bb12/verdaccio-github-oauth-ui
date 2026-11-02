# 🗃️ Compatibility

| Requirement   | Details                                                             |
| ------------- | ------------------------------------------------------------------- |
| **Verdaccio** | 6.x, 7.x                                                            |
| **Node.js**   | 20.12+, 22, 24                                                      |
| **npm**       | 10                                                                  |
| **Browsers**  | Last 2 Chrome, Edge, Firefox, and Safari versions, plus Firefox ESR |

The UI script is built with `bun build --target=browser`. That selects a
browser runtime. Bun keeps the JavaScript syntax as written and ships no
polyfills. The script uses optional chaining and `async`/`await`, which the
browsers above, including current Firefox ESR, already run.

Note: Other versions may be compatible, but only these versions have been tested.
