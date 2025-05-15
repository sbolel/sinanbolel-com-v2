/**
 * @module @cyclone-dx/ui/sbom/utils/setupTests
 */
// global mocks
jest.mock('aws-amplify')
jest.mock('web-vitals')

// enable mocking of fetch requests
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()

import '@testing-library/jest-dom'

if (process.env.NODE_ENV === 'test') {
  // mock environment variables for the global app config during tests
  process.env.VITE_AWS_REGION = 'us-east-1'
  process.env.VITE_CF_DOMAIN = 'https://localhost:3000/'
  process.env.VITE_USER_POOL_ID = 'us-east-1_123456789'
  process.env.VITE_USER_POOL_CLIENT_ID = '1234567890123456789012'
}

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
})

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
})

// Configure React testing environment for act() support
import { configure } from '@testing-library/react'

// Configure longer timeout for async tests with act()
configure({
  asyncUtilTimeout: 5000,
})

// Add support for concurrent act() environments
// This helps with "Warning: The current testing environment is not configured to support act(...)"
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Extra configuration to deal with react-hook-form state updates
// This prevents "not configured to support act(...)" warnings with hooks that cause nested state updates
const originalError = console.error
console.error = (...args) => {
  // Don't completely silence the error but filter out act() warnings
  if (
    args[0]?.includes?.(
      'Warning: The current testing environment is not configured to support act'
    )
  ) {
    return
  }
  originalError(...args)
}

// Add TextEncoder/TextDecoder polyfill for JSDOM environment
// This is needed for React Router v7 and other libraries
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
