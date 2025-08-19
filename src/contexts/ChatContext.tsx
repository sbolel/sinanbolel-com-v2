import React, { createContext, useReducer } from 'react'
import { Message } from '@/types/chat'
import { AuthProviderProps } from '@/store/auth/types'

export interface ChatState {
  messages: Message[]
  chatId: string | null
  showCaption: boolean
}

export type ChatAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CHAT_ID'; payload: string }
  | { type: 'SHOW_CAPTION'; payload: boolean }

const initialState: ChatState = {
  messages: [],
  chatId: null,
  showCaption: false,
}

export const chatReducer = (
  state: ChatState,
  action: ChatAction
): ChatState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_CHAT_ID':
      return { ...state, chatId: action.payload }
    case 'SHOW_CAPTION':
      return { ...state, showCaption: action.payload }
    default:
      return state
  }
}

interface ChatContextProps {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
}

export const ChatContext = createContext<ChatContextProps>({
  state: initialState,
  dispatch: () => null,
})

export const ChatProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  )
}
