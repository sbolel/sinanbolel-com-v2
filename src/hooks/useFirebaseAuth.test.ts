import { renderHook } from '@testing-library/react'
import useFirebaseAuth from '@/hooks/useFirebaseAuth'
import { auth } from '@/firebase'

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
    auth.currentUser = null
    const { result, unmount } = renderHook(() => useFirebaseAuth())
    expect(result.current).toEqual(user)
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })

  test('initial user comes from auth.currentUser', () => {
    const current = { uid: 'init' } as any
    ;(auth.onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn())
    auth.currentUser = current
    const { result } = renderHook(() => useFirebaseAuth())
    expect(result.current).toBe(current)
  })
})
