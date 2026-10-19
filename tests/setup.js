import { afterEach } from 'vitest'

// DOM helpers only make sense in jsdom-environment files.
if (typeof window !== 'undefined') {
  await import('@testing-library/jest-dom/vitest')
  const { cleanup } = await import('@testing-library/react')
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })
}
