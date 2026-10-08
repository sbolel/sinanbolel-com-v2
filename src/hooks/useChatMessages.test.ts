import { act, renderHook } from '@testing-library/react'
import useChatMessages from './useChatMessages'
import { onSnapshot } from 'firebase/firestore'

jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  query: jest.fn(() => 'query'),
  collection: jest.fn(),
  orderBy: jest.fn(),
}))

let listeners: {
  next: (snapshot: any) => void
  error: (error: unknown) => void
  unsubscribe: jest.Mock
}[]
beforeEach(() => {
  listeners = []
  ;(onSnapshot as jest.Mock).mockImplementation((_query, next, error) => {
    const listener = { next, error, unsubscribe: jest.fn() }
    listeners.push(listener)
    return listener.unsubscribe
  })
})
const snapshot = {
  docs: [{ data: () => ({ body: 'Hello', from: 'visitor' }) }],
}

test('requires both identity and chat, then reports the first snapshot', () => {
  const dispatch = jest.fn()
  const { result, rerender } = renderHook(
    ({ uid, chat }) => useChatMessages(uid, chat, dispatch),
    {
      initialProps: { uid: null as string | null, chat: null as string | null },
    }
  )
  expect(onSnapshot).not.toHaveBeenCalled()
  rerender({ uid: 'visitor', chat: 'chat' })
  expect(result.current.status).toBe('loading')
  act(() => listeners[0].next(snapshot))
  expect(result.current.status).toBe('ready')
  expect(dispatch).toHaveBeenCalledWith({
    type: 'SET_MESSAGES',
    payload: [{ body: 'Hello', from: 'visitor' }],
  })
})

test('reports listener errors and retries the subscription', () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  const dispatch = jest.fn()
  const { result } = renderHook(() =>
    useChatMessages('visitor', 'chat', dispatch)
  )
  act(() => listeners[0].error({ code: 'permission-denied' }))
  expect(result.current.status).toBe('error')
  act(() => result.current.retry())
  expect(listeners[0].unsubscribe).toHaveBeenCalled()
  act(() => listeners[1].next(snapshot))
  expect(result.current.status).toBe('ready')
  log.mockRestore()
})

test('unsubscribes on identity changes and ignores stale callbacks', () => {
  const dispatch = jest.fn()
  const { result, rerender, unmount } = renderHook(
    ({ uid }) => useChatMessages(uid, 'chat', dispatch),
    { initialProps: { uid: 'old' } }
  )
  rerender({ uid: 'new' })
  expect(listeners[0].unsubscribe).toHaveBeenCalled()
  act(() => listeners[0].next(snapshot))
  act(() => listeners[0].error({ code: 'permission-denied' }))
  expect(dispatch).not.toHaveBeenCalled()
  expect(result.current.status).toBe('loading')
  unmount()
  expect(listeners[1].unsubscribe).toHaveBeenCalled()
})
