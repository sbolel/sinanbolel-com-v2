import { renderHook } from '@testing-library/react'
import useFirebaseAuth from '@/hooks/useFirebaseAuth'
import { auth } from '@/firebase'

// Mock the auth module to allow currentUser modification
jest.mock('@/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
}))

describe('useFirebaseAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns and updates current user', () => {
    const unsubscribe = jest.fn()
    const user = { uid: '123' } as any
    ;(auth.onAuthStateChanged as jest.Mock).mockImplementation((cb) => {
      cb(user)
      return unsubscribe
    })
    ;(auth as any).currentUser = null
    const { result, unmount } = renderHook(() => useFirebaseAuth())
    expect(result.current).toEqual(user)
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })

  test('initial user comes from auth.currentUser', () => {
    const current = { uid: 'init' } as any
    ;(auth.onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn())
    ;(auth as any).currentUser = current
    const { result } = renderHook(() => useFirebaseAuth())
    expect(result.current).toBe(current)
  })
})
