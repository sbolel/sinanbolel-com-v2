import { act, renderHook, waitFor } from '@testing-library/react'
import useUserChats from './useUserChats'
import { getUserChats } from '@/firebase/firestore'

jest.mock('@/firebase/firestore', () => ({ getUserChats: jest.fn() }))
const fetchChats = getUserChats as jest.Mock

test('waits for authentication and fetches when the UID becomes available', async () => {
  const dispatch = jest.fn()
  fetchChats.mockResolvedValue([{ id: 'chat1' }])
  const { result, rerender } = renderHook(
    ({ uid }) => useUserChats(uid, dispatch),
    { initialProps: { uid: null as string | null } }
  )
  expect(fetchChats).not.toHaveBeenCalled()
  expect(result.current.status).toBe('idle')
  rerender({ uid: 'visitor' })
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(fetchChats).toHaveBeenCalledWith('visitor')
  expect(dispatch).toHaveBeenCalledWith({
    type: 'SET_CHAT_ID',
    payload: 'chat1',
  })
})

test('an empty history is a successful lookup', async () => {
  const dispatch = jest.fn()
  fetchChats.mockResolvedValue([])
  const { result } = renderHook(() => useUserChats('visitor', dispatch))
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_CHAT_ID', payload: null })
})

test('ignores an obsolete response after the UID changes', async () => {
  const dispatch = jest.fn()
  let resolve!: (value: any) => void
  fetchChats
    .mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      })
    )
    .mockResolvedValue([{ id: 'new-chat' }])
  const { result, rerender } = renderHook(
    ({ uid }) => useUserChats(uid, dispatch),
    { initialProps: { uid: 'old' } }
  )
  rerender({ uid: 'new' })
  await waitFor(() => expect(result.current.status).toBe('ready'))
  await act(async () => resolve([{ id: 'old-chat' }]))
  expect(dispatch.mock.calls).toEqual([
    [{ type: 'SET_CHAT_ID', payload: 'new-chat' }],
  ])
})

test('reports lookup errors and retries without writing messages', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  const dispatch = jest.fn()
  fetchChats
    .mockRejectedValueOnce({ code: 'permission-denied' })
    .mockResolvedValue([])
  const { result } = renderHook(() => useUserChats('visitor', dispatch))
  await waitFor(() => expect(result.current.status).toBe('error'))
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(fetchChats).toHaveBeenCalledTimes(2)
  log.mockRestore()
})
