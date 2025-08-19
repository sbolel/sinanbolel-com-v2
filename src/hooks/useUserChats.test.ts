import { renderHook, waitFor } from '@testing-library/react'
import useUserChats from '@/hooks/useUserChats'
import { auth } from '@/firebase'
import { getUserChats } from '@/firebase/firestore'

jest.mock('@/firebase/firestore', () => ({
  getUserChats: jest.fn(),
}))

// Mock the auth module to allow currentUser modification
jest.mock('@/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
}))

describe('useUserChats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetches chats and dispatches chat id', async () => {
    const dispatch = jest.fn()
    ;(auth as any).currentUser = { uid: 'user1' }
    ;(getUserChats as jest.Mock).mockResolvedValue([{ id: 'chat1' }])
    renderHook(() => useUserChats(dispatch))
    await waitFor(() => {
      expect(getUserChats).toHaveBeenCalledWith('user1')
    })
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CHAT_ID',
        payload: 'chat1',
      })
    })
  })

  test('does nothing when no current user', async () => {
    const dispatch = jest.fn()
    ;(auth as any).currentUser = null
    renderHook(() => useUserChats(dispatch))
    await waitFor(() => {
      expect(getUserChats).not.toHaveBeenCalled()
      expect(dispatch).not.toHaveBeenCalled()
    })
  })
})
