import { vi } from "vitest"

vi.spyOn(process, "exit").mockImplementation((() => {}) as any)
