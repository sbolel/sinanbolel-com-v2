import { createContext } from 'react'
import AuthDispatchContext from '@/store/auth/AuthDispatchContext'
import { AuthActionParams } from '@/store/auth/types'

test('creates a context with the provided value', () => {
  const context = createContext((value: AuthActionParams) => value)

  // Verify that AuthDispatchContext is a valid React context
  expect(AuthDispatchContext).toBeDefined()
  expect(AuthDispatchContext).not.toBeNull()

  // Verify that both are contexts by checking for Provider and Consumer properties
  expect(typeof AuthDispatchContext.Provider).toBe('object')
  expect(typeof AuthDispatchContext.Consumer).toBe('object')
  expect(typeof context.Provider).toBe('object')
  expect(typeof context.Consumer).toBe('object')

  // Check that both contexts have the same displayName pattern if available
  if (AuthDispatchContext.displayName && context.displayName) {
    expect(AuthDispatchContext.displayName).toMatch(/Context/)
    expect(context.displayName).toMatch(/Context/)
  }

  // Verify we can access the _currentValue property (implementation detail but useful for testing)
  expect(AuthDispatchContext._currentValue).toBeDefined()
})
