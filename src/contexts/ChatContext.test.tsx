import { render } from '@testing-library/react'
import React, { useContext } from 'react'
import {
  chatReducer,
  ChatProvider,
  ChatContext,
  type ChatState,
} from './ChatContext'
import { type Message } from '@/types/chat'

describe('chatReducer', () => {
  const initial: ChatState = { messages: [], chatId: null, showCaption: false }

  test('handles SET_MESSAGES', () => {
    const messages = [
      { body: 'hi', from: 'user', createdAt: {} as any } as Message,
    ]
    const state = chatReducer(initial, {
      type: 'SET_MESSAGES',
      payload: messages,
    })
    expect(state.messages).toEqual(messages)
  })

  test('handles ADD_MESSAGE', () => {
    const message = {
      body: 'hi',
      from: 'user',
      createdAt: {} as any,
    } as Message
    const state = chatReducer(initial, {
      type: 'ADD_MESSAGE',
      payload: message,
    })
    expect(state.messages).toEqual([message])
  })

  test('handles SET_CHAT_ID', () => {
    const state = chatReducer(initial, { type: 'SET_CHAT_ID', payload: 'id1' })
    expect(state.chatId).toBe('id1')
  })

  test('handles SHOW_CAPTION', () => {
    const state = chatReducer(initial, { type: 'SHOW_CAPTION', payload: true })
    expect(state.showCaption).toBe(true)
  })

  test('returns current state for unknown action', () => {
    // @ts-expect-error testing unknown action
    const state = chatReducer(initial, { type: 'UNKNOWN' })
    expect(state).toBe(initial)
  })
})

describe('ChatProvider', () => {
  test('provides initial state and dispatch', () => {
    let contextValue:
      | { state: ChatState; dispatch: React.Dispatch<any> }
      | undefined
    const Consumer = () => {
      contextValue = useContext(ChatContext)
      return <div>child</div>
    }
    const { getByText } = render(
      <ChatProvider>
        <Consumer />
      </ChatProvider>
    )
    expect(getByText('child')).toBeInTheDocument()
    expect(contextValue?.state).toEqual({
      messages: [],
      chatId: null,
      showCaption: false,
    })
    expect(typeof contextValue?.dispatch).toBe('function')
  })
})
