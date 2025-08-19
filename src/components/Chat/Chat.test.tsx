import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chat from './Chat'
import { ChatContext, type ChatState } from '@/contexts/ChatContext'
import useFirebaseAuth from '@/hooks/useFirebaseAuth'
import { createChat, addMessageToChat } from '@/firebase/firestore'

jest.mock('@/hooks/useFirebaseAuth')
jest.mock('@/hooks/useUserChats')
jest.mock('@/hooks/useChatMessages')
jest.mock('@/hooks/useAutoScroll')
jest.mock('@/firebase/firestore')
jest.mock('dompurify', () => ({ sanitize: jest.fn((s: string) => s) }))

const mockUseFirebaseAuth = useFirebaseAuth as jest.Mock
const mockCreateChat = createChat as jest.Mock
const mockAddMessage = addMessageToChat as jest.Mock

const renderChat = (state: ChatState, dispatch = jest.fn()) => {
  render(
    <ChatContext.Provider value={{ state, dispatch }}>
      <Chat />
    </ChatContext.Provider>
  )
}

describe('Chat component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAddMessage.mockResolvedValue(undefined)
  })

  test('shows an error when user is not authenticated', async () => {
    mockUseFirebaseAuth.mockReturnValue(null)
    const state: ChatState = { messages: [], chatId: null, showCaption: false }
    renderChat(state)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'Hello')
    expect(input).toHaveValue('Hello')
    const form = input.closest('form') as HTMLFormElement
    fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('User is not authenticated')).toBeInTheDocument()
    })
    expect(mockAddMessage).not.toHaveBeenCalled()
  })

  test('creates a new chat and sends message', async () => {
    mockUseFirebaseAuth.mockReturnValue({ uid: 'user1' })
    mockCreateChat.mockResolvedValue('newChat')
    const dispatch = jest.fn()
    const state: ChatState = { messages: [], chatId: null, showCaption: false }
    renderChat(state, dispatch)

    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'Hi')
    expect(input).toHaveValue('Hi')
    const form = input.closest('form') as HTMLFormElement
    await act(async () => {
      fireEvent.submit(form)
    })

    await waitFor(() => {
      expect(mockCreateChat).toHaveBeenCalled()
      expect(mockAddMessage).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CHAT_ID',
        payload: 'newChat',
      })
      expect(input.value).toBe('')
    })

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SHOW_CAPTION',
      payload: true,
    })
  })

  test('sends message using existing chatId', async () => {
    mockUseFirebaseAuth.mockReturnValue({ uid: 'user2' })
    const state: ChatState = {
      messages: [],
      chatId: 'chat123',
      showCaption: false,
    }
    const dispatch = jest.fn()
    renderChat(state, dispatch)

    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'Existing')
    expect(input).toHaveValue('Existing')
    const form = input.closest('form') as HTMLFormElement
    await act(async () => {
      fireEvent.submit(form)
    })

    await waitFor(() => {
      expect(mockCreateChat).not.toHaveBeenCalled()
      expect(mockAddMessage).toHaveBeenCalled()
    })
  })

  test('shows error when sending message fails', async () => {
    mockUseFirebaseAuth.mockReturnValue({ uid: 'user3' })
    mockCreateChat.mockResolvedValue('errChat')
    mockAddMessage.mockRejectedValue(new Error('fail'))
    const dispatch = jest.fn()
    const state: ChatState = { messages: [], chatId: null, showCaption: false }
    renderChat(state, dispatch)

    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'Oops')
    const form = input.closest('form') as HTMLFormElement
    await act(async () => {
      fireEvent.submit(form)
    })

    await waitFor(() => {
      expect(
        screen.getByText('Failed to send message. Please try again.')
      ).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeButton)
    await waitFor(() => {
      expect(
        screen.queryByText('Failed to send message. Please try again.')
      ).not.toBeInTheDocument()
    })
  })
})
