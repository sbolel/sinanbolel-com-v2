import React, { useContext } from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { ChatProvider, ChatContext, type ChatContextProps } from './ChatContext'
import useFirebaseAuth from '@/hooks/useFirebaseAuth'
import { getUserChats } from '@/firebase/firestore'
import { onSnapshot } from 'firebase/firestore'

jest.mock('@/hooks/useFirebaseAuth')
jest.mock('@/firebase/firestore', () => ({ getUserChats: jest.fn() }))
jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  query: jest.fn(),
  collection: jest.fn(),
  orderBy: jest.fn(),
}))

let current: ChatContextProps
let snapshots: ((snapshot: any) => void)[]
let subscriptions: jest.Mock[]
const authState = (uid: string | null) => ({
  user: uid ? { uid } : null,
  status: uid ? 'ready' : 'initializing',
  error: null,
  retry: jest.fn(),
})
function Consumer() {
  current = useContext(ChatContext)
  return <div>{current.state.chatId}</div>
}
beforeEach(() => {
  snapshots = []
  subscriptions = []
  ;(useFirebaseAuth as jest.Mock).mockReturnValue(authState(null))
  ;(getUserChats as jest.Mock).mockImplementation(async (uid) => [
    { id: uid + '-chat' },
  ])
  ;(onSnapshot as jest.Mock).mockImplementation((_q, next) => {
    snapshots.push(next)
    const unsubscribe = jest.fn()
    subscriptions.push(unsubscribe)
    return unsubscribe
  })
})

test('auth readiness starts history loading and identity changes clear old data and actions', async () => {
  const view = render(
    <ChatProvider>
      <Consumer />
    </ChatProvider>
  )
  expect(getUserChats).not.toHaveBeenCalled()
  ;(useFirebaseAuth as jest.Mock).mockReturnValue(authState('alice'))
  view.rerender(
    <ChatProvider>
      <Consumer />
    </ChatProvider>
  )
  await waitFor(() => expect(current.state.chatId).toBe('alice-chat'))
  act(() => {
    snapshots[0]({
      docs: [{ data: () => ({ body: 'private alice', from: 'alice' }) }],
    })
    current.dispatch({ type: 'SHOW_CAPTION', payload: true })
  })
  const obsoleteDispatch = current.dispatch
  expect(current.state.messages).toHaveLength(1)
  ;(useFirebaseAuth as jest.Mock).mockReturnValue(authState('bob'))
  view.rerender(
    <ChatProvider>
      <Consumer />
    </ChatProvider>
  )
  expect(current.state.messages).toEqual([])
  expect(current.state.showCaption).toBe(false)
  expect(subscriptions[0]).toHaveBeenCalled()
  act(() => {
    obsoleteDispatch({ type: 'SET_CHAT_ID', payload: 'obsolete-alice-chat' })
    snapshots[0]({ docs: [{ data: () => ({ body: 'obsolete' }) }] })
  })
  await waitFor(() => expect(current.state.chatId).toBe('bob-chat'))
  expect(current.state.messages).toEqual([])
})

test('ordinary consumer close and reopen preserves chat ID and subscriptions', async () => {
  ;(useFirebaseAuth as jest.Mock).mockReturnValue(authState('alice'))
  const view = render(
    <ChatProvider>
      <Consumer />
    </ChatProvider>
  )
  await waitFor(() => expect(current.state.chatId).toBe('alice-chat'))
  view.rerender(
    <ChatProvider>
      <div>closed</div>
    </ChatProvider>
  )
  view.rerender(
    <ChatProvider>
      <Consumer />
    </ChatProvider>
  )
  expect(current.state.chatId).toBe('alice-chat')
  expect(getUserChats).toHaveBeenCalledTimes(1)
  expect(onSnapshot).toHaveBeenCalledTimes(1)
})
