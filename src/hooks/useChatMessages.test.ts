import { renderHook } from '@testing-library/react'
import useChatMessages from '@/hooks/useChatMessages'
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  query: jest.fn(() => 'query'),
  collection: jest.fn(),
  orderBy: jest.fn(),
}))

const mockDispatch = jest.fn()

describe('useChatMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('subscribes to messages and dispatches updates', () => {
    const unsubscribe = jest.fn()
    ;(onSnapshot as jest.Mock).mockImplementation((_q, cb) => {
      cb({ docs: [{ data: () => ({ id: 1 }) }] })
      return unsubscribe
    })

    renderHook(() => useChatMessages('chat1', mockDispatch))

    expect(query).toHaveBeenCalled()
    expect(collection).toHaveBeenCalledWith(db, 'chats', 'chat1', 'messages')
    expect(orderBy).toHaveBeenCalledWith('createdAt', 'asc')
    expect(onSnapshot).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_MESSAGES',
      payload: [{ id: 1 }],
    })
  })

  test('does nothing when chatId is null', () => {
    renderHook(() => useChatMessages(null, mockDispatch))
    expect(onSnapshot).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  test('cleans up on unmount', () => {
    const unsubscribe = jest.fn()
    ;(onSnapshot as jest.Mock).mockImplementation(() => unsubscribe)
    const { unmount } = renderHook(() => useChatMessages('chat1', mockDispatch))
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
