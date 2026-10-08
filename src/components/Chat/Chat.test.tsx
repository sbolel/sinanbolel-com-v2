import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useCallback, useReducer } from 'react'
import DOMPurify from 'dompurify'
import Chat from './Chat'
import {
  ChatContext,
  chatReducer,
  type ChatContextProps,
  type ChatState,
} from '@/contexts/ChatContext'
import { createChat, addMessageToChat } from '@/firebase/firestore'

jest.mock('@/firebase/firestore', () => ({
  createChat: jest.fn(),
  addMessageToChat: jest.fn(),
}))
jest.mock('@/hooks/useAutoScroll')
jest.mock('dompurify', () => ({ sanitize: jest.fn() }))

const mockCreate = createChat as jest.Mock
const mockAdd = addMessageToChat as jest.Mock
const state: ChatState = { messages: [], chatId: null, showCaption: false }
const readyRead = { status: 'ready' as const, error: null, retry: jest.fn() }
const connected: ChatContextProps['auth'] = {
  user: { uid: 'owner' } as any,
  status: 'ready',
  error: null,
  retry: jest.fn(),
}
let dispatchSpy: jest.Mock
let log: jest.SpyInstance

function Harness({
  overrides = {},
  show = true,
}: {
  overrides?: Partial<ChatContextProps>
  show?: boolean
}) {
  const [chatState, reduce] = useReducer(chatReducer, overrides.state ?? state)
  const dispatch = useCallback((action: any) => {
    dispatchSpy(action)
    reduce(action)
  }, [])
  return (
    <ChatContext.Provider
      value={{
        dispatch,
        auth: connected,
        history: readyRead,
        messageStatus: readyRead,
        ...overrides,
        state: chatState,
      }}
    >
      <output data-testid="chat-id">{chatState.chatId}</output>
      {show && <Chat />}
    </ChatContext.Provider>
  )
}
const submit = () =>
  fireEvent.submit(screen.getByRole('textbox').closest('form')!)
beforeEach(() => {
  dispatchSpy = jest.fn()
  ;(DOMPurify.sanitize as jest.Mock).mockImplementation((s: string) => s)
  mockCreate.mockResolvedValue('new-chat')
  mockAdd.mockResolvedValue(undefined)
  log = jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => log.mockRestore())

test('creates a conversation and clears the draft only after confirmed delivery', async () => {
  let confirm!: () => void
  mockAdd.mockReturnValue(
    new Promise<void>((resolve) => {
      confirm = resolve
    })
  )
  render(<Harness />)
  await userEvent.type(screen.getByRole('textbox'), 'Hello')
  act(submit)
  await waitFor(() => expect(mockAdd).toHaveBeenCalled())
  expect(mockCreate).toHaveBeenCalledWith('owner')
  expect(screen.getByRole('textbox')).toHaveValue('Hello')
  expect(screen.getByRole('textbox')).toBeDisabled()
  expect(
    screen.queryByText('Your message has been sent')
  ).not.toBeInTheDocument()
  await act(async () => confirm())
  expect(screen.getByRole('textbox')).toHaveValue('')
  expect(screen.getByText('Your message has been sent')).toBeInTheDocument()
})

test('uses an existing conversation', async () => {
  render(<Harness overrides={{ state: { ...state, chatId: 'existing' } }} />)
  await userEvent.type(screen.getByRole('textbox'), 'Hello')
  act(submit)
  await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(''))
  expect(mockCreate).not.toHaveBeenCalled()
  expect(mockAdd).toHaveBeenCalledWith('existing', {
    body: 'Hello',
    from: 'owner',
  })
})

test('retains the draft and created chat ID after failure, then reuses it on retry', async () => {
  mockAdd.mockRejectedValueOnce({
    code: 'permission-denied',
    message: 'private',
  })
  render(<Harness />)
  await userEvent.type(screen.getByRole('textbox'), 'Retry me')
  act(submit)
  await screen.findByText('Failed to send message. Please try again.')
  expect(screen.getByRole('textbox')).toHaveValue('Retry me')
  expect(screen.getByTestId('chat-id')).toHaveTextContent('new-chat')
  expect(
    screen.queryByText('Your message has been sent')
  ).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /send message/i }))
  await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(''))
  expect(mockCreate).toHaveBeenCalledTimes(1)
  expect(mockAdd).toHaveBeenLastCalledWith('new-chat', {
    body: 'Retry me',
    from: 'owner',
  })
  expect(
    screen.queryByText('Failed to send message. Please try again.')
  ).not.toBeInTheDocument()
  expect(log).toHaveBeenCalledWith('send-chat-message', 'permission-denied')
})

test.each([undefined, ''])(
  'missing chat ID never reports success: %p',
  async (id) => {
    mockCreate.mockResolvedValue(id)
    render(<Harness />)
    await userEvent.type(screen.getByRole('textbox'), 'Keep me')
    act(submit)
    await screen.findByText('Failed to send message. Please try again.')
    expect(mockAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('Keep me')
    expect(
      screen.queryByText('Your message has been sent')
    ).not.toBeInTheDocument()
  }
)

test('a synchronous submission guard prevents duplicate writes', async () => {
  let confirm!: () => void
  mockAdd.mockReturnValue(
    new Promise<void>((resolve) => {
      confirm = resolve
    })
  )
  render(<Harness />)
  await userEvent.type(screen.getByRole('textbox'), 'Once')
  act(() => {
    submit()
    submit()
  })
  await waitFor(() => expect(mockAdd).toHaveBeenCalledTimes(1))
  expect(mockCreate).toHaveBeenCalledTimes(1)
  await act(async () => confirm())
})

test('rejects content that becomes empty after sanitization', async () => {
  ;(DOMPurify.sanitize as jest.Mock).mockReturnValue(' ')
  render(<Harness />)
  await userEvent.type(screen.getByRole('textbox'), 'removed content')
  act(submit)
  expect(
    screen.getByText('Please enter a message before sending.')
  ).toBeInTheDocument()
  expect(mockCreate).not.toHaveBeenCalled()
  expect(screen.getByRole('textbox')).toHaveValue('removed content')
})

test.each([
  [
    'authentication',
    { auth: { ...connected, user: null, status: 'initializing' as const } },
    'Connecting to chat...',
  ],
  [
    'history',
    { history: { ...readyRead, status: 'loading' as const } },
    'Loading your conversation...',
  ],
  [
    'messages',
    { messageStatus: { ...readyRead, status: 'loading' as const } },
    'Loading messages...',
  ],
])(
  'keeps draft editing available while %s loads and blocks send',
  async (_name, overrides, text) => {
    render(<Harness overrides={overrides} />)
    await userEvent.type(screen.getByRole('textbox'), 'Wait for me')
    expect(screen.getByText(text)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
    expect(screen.getByRole('textbox')).toBeEnabled()
    act(submit)
    expect(mockCreate).not.toHaveBeenCalled()
  }
)

test.each([
  ['auth', 'Could not connect to chat. Please try again.'],
  ['history', 'Could not load your conversation. Please try again.'],
  ['messageStatus', 'Could not load messages. Please try again.'],
] as const)(
  'shows %s errors and retries reads without resending',
  async (key, message) => {
    const retry = jest.fn()
    const value =
      key === 'auth'
        ? {
            ...connected,
            user: null,
            status: 'error' as const,
            error: 'unknown',
            retry,
          }
        : { status: 'error' as const, error: 'unknown', retry }
    render(<Harness overrides={{ [key]: value }} />)
    await userEvent.type(screen.getByRole('textbox'), 'Preserved')
    expect(screen.getByText(message)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledTimes(1)
    expect(mockAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('Preserved')
  }
)

test('a late completion cannot clear a draft after identity changes', async () => {
  let confirm!: () => void
  mockAdd.mockReturnValue(
    new Promise<void>((resolve) => {
      confirm = resolve
    })
  )
  const view = render(<Harness />)
  await userEvent.type(screen.getByRole('textbox'), 'Preserved')
  act(submit)
  await waitFor(() => expect(mockAdd).toHaveBeenCalled())
  view.rerender(
    <Harness
      overrides={{ auth: { ...connected, user: { uid: 'new-owner' } as any } }}
    />
  )
  await act(async () => confirm())
  expect(screen.getByRole('textbox')).toHaveValue('Preserved')
  expect(
    screen.queryByText('Your message has been sent')
  ).not.toBeInTheDocument()
})

test('closing chat during creation retains the shared conversation without cancelling the submitted write', async () => {
  let created!: (id: string) => void
  mockCreate.mockReturnValue(
    new Promise<string>((resolve) => {
      created = resolve
    })
  )
  const view = render(<Harness />)
  await userEvent.type(screen.getByRole('textbox'), 'Submitted')
  act(submit)
  view.rerender(<Harness show={false} />)
  await act(async () => created('created-while-closed'))
  expect(screen.getByTestId('chat-id')).toHaveTextContent(
    'created-while-closed'
  )
  expect(mockAdd).toHaveBeenCalledTimes(1)
  view.rerender(<Harness />)
  expect(screen.getByTestId('chat-id')).toHaveTextContent(
    'created-while-closed'
  )
})
