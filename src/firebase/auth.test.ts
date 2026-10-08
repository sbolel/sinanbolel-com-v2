import { ensureFirebaseUser } from './auth'
import { auth } from '@/firebase'
import { signInAnonymously } from 'firebase/auth'
import { createSession } from './firestore'
import { createElement, StrictMode, type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import useFirebaseAuth from '@/hooks/useFirebaseAuth'

jest.mock('firebase/auth', () => ({ signInAnonymously: jest.fn() }))
jest.mock('./firestore', () => ({ createSession: jest.fn() }))

const user = { uid: 'visitor' } as any
const mockSignIn = signInAnonymously as jest.Mock
const mockSession = createSession as jest.Mock
const mockReady = auth.authStateReady as jest.Mock

beforeEach(() => {
  ;(auth as any).currentUser = null
  mockReady.mockResolvedValue(undefined)
  mockSession.mockResolvedValue(undefined)
  mockSignIn.mockImplementation(async () => {
    ;(auth as any).currentUser = user
    return { user }
  })
})

test('waits for restored auth and reuses the existing user', async () => {
  let resolveReady!: () => void
  mockReady.mockReturnValue(
    new Promise<void>((resolve) => {
      resolveReady = resolve
    })
  )
  const pending = ensureFirebaseUser()
  expect(mockSignIn).not.toHaveBeenCalled()
  ;(auth as any).currentUser = user
  resolveReady()
  await expect(pending).resolves.toBe(user)
  expect(mockSignIn).not.toHaveBeenCalled()
  expect(mockSession).not.toHaveBeenCalled()
})

test('concurrent initialization shares one anonymous sign-in and session', async () => {
  const first = ensureFirebaseUser()
  const second = ensureFirebaseUser()
  expect(first).toBe(second)
  await expect(first).resolves.toBe(user)
  expect(mockSignIn).toHaveBeenCalledTimes(1)
  expect(mockSession).toHaveBeenCalledTimes(1)
})

test('rejected initialization clears the pending promise for retry', async () => {
  mockSignIn.mockRejectedValueOnce({ code: 'auth/network-request-failed' })
  await expect(ensureFirebaseUser()).rejects.toMatchObject({
    code: 'auth/network-request-failed',
  })
  await expect(ensureFirebaseUser()).resolves.toBe(user)
  expect(mockSignIn).toHaveBeenCalledTimes(2)
})

test('Strict Mode remounts share initialization without duplicate sign-ins', async () => {
  const { result } = renderHook(() => useFirebaseAuth(), {
    wrapper: ({ children }: PropsWithChildren) =>
      createElement(StrictMode, null, children),
  })
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(mockSignIn).toHaveBeenCalledTimes(1)
  expect(mockSession).toHaveBeenCalledTimes(1)
})

test('a pending session write does not hold authentication open', async () => {
  mockSession.mockReturnValue(new Promise<void>(() => {}))
  await expect(ensureFirebaseUser()).resolves.toBe(user)
})

test('a failed or pending session write does not block authentication', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  mockSession.mockRejectedValueOnce(
    Object.assign(new Error('private diagnostic'), {
      code: 'permission-denied',
    })
  )
  await expect(ensureFirebaseUser()).resolves.toBe(user)
  await Promise.resolve()
  expect(log).toHaveBeenCalledWith('create-session', 'permission-denied')
  log.mockRestore()
})
