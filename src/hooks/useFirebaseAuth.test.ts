import { act, renderHook, waitFor } from '@testing-library/react'
import useFirebaseAuth from './useFirebaseAuth'
import { auth } from '@/firebase'
import { ensureFirebaseUser } from '@/firebase/auth'

jest.mock('@/firebase/auth', () => ({ ensureFirebaseUser: jest.fn() }))
const mockEnsure = ensureFirebaseUser as jest.Mock
const user = { uid: 'visitor' } as any
let notify: (user: any) => void
let unsubscribe: jest.Mock

beforeEach(() => {
  ;(auth as any).currentUser = user
  unsubscribe = jest.fn()
  ;(auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
    notify = callback
    return unsubscribe
  })
  mockEnsure.mockResolvedValue(user)
})

test('reports readiness and cleans up its auth observer', async () => {
  const { result, unmount } = renderHook(() => useFirebaseAuth())
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.user).toBe(user)
  unmount()
  expect(unsubscribe).toHaveBeenCalled()
})

test('keeps initialization pending until delayed authentication completes', async () => {
  ;(auth as any).currentUser = null
  let resolve!: (user: any) => void
  mockEnsure.mockReturnValue(
    new Promise((done) => {
      resolve = done
    })
  )
  const { result } = renderHook(() => useFirebaseAuth())
  expect(result.current.status).toBe('initializing')
  await act(async () => {
    ;(auth as any).currentUser = user
    resolve(user)
  })
  expect(result.current.status).toBe('ready')
})

test('reports sign-in failure and supports an explicit retry', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  ;(auth as any).currentUser = null
  mockEnsure.mockRejectedValueOnce({ code: 'auth/network-request-failed' })
  const { result } = renderHook(() => useFirebaseAuth())
  await waitFor(() => expect(result.current.status).toBe('error'))
  ;(auth as any).currentUser = user
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.error).toBeNull()
  log.mockRestore()
})

test('an obsolete initialization cannot replace a newer auth identity', async () => {
  let resolve!: (user: any) => void
  mockEnsure.mockReturnValue(
    new Promise((done) => {
      resolve = done
    })
  )
  const { result } = renderHook(() => useFirebaseAuth())
  const newer = { uid: 'newer' }
  act(() => {
    ;(auth as any).currentUser = newer
    notify(newer)
  })
  await act(async () => resolve(user))
  expect(result.current.user).toBe(newer)
})

test('ignores a late initialization failure after unmount', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  let reject!: (error: unknown) => void
  mockEnsure.mockReturnValue(
    new Promise((_resolve, fail) => {
      reject = fail
    })
  )
  const { unmount } = renderHook(() => useFirebaseAuth())
  unmount()
  await act(async () => reject({ code: 'auth/network-request-failed' }))
  expect(log).not.toHaveBeenCalled()
  log.mockRestore()
})
