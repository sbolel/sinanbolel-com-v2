import React, {
  createContext,
  useReducer,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { Message } from '@/types/chat'
import useFirebaseAuth, {
  type FirebaseAuthResult,
} from '@/hooks/useFirebaseAuth'
import useUserChats from '@/hooks/useUserChats'
import useChatMessages from '@/hooks/useChatMessages'
import type { ChatLoadResult } from '@/hooks/chatStatus'

export interface ChatState {
  messages: Message[]
  chatId: string | null
  showCaption: boolean
}

export type ChatAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CHAT_ID'; payload: string | null }
  | { type: 'SHOW_CAPTION'; payload: boolean }
  | { type: 'RESET_CHAT' }

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
      return state.chatId === action.payload
        ? state
        : {
            ...initialState,
            chatId: action.payload,
          }
    case 'SHOW_CAPTION':
      return { ...state, showCaption: action.payload }
    case 'RESET_CHAT':
      return initialState
    default:
      return state
  }
}

export interface ChatContextProps {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  auth: FirebaseAuthResult
  history: ChatLoadResult
  messageStatus: ChatLoadResult
}

const idleRead: ChatLoadResult = {
  status: 'idle',
  error: null,
  retry: () => {},
}

export const ChatContext = createContext<ChatContextProps>({
  state: initialState,
  dispatch: () => null,
  auth: { user: null, status: 'initializing', error: null, retry: () => {} },
  history: idleRead,
  messageStatus: idleRead,
})

type ChatProviderProps = React.PropsWithChildren

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const firebaseAuth = useFirebaseAuth()
  const userId =
    firebaseAuth.status === 'ready' ? (firebaseAuth.user?.uid ?? null) : null
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const [ownerId, setOwnerId] = useState(userId)
  const identity = useRef({ userId, generation: 0 })
  if (identity.current.userId !== userId) {
    identity.current = { userId, generation: identity.current.generation + 1 }
  }
  const identityGeneration = identity.current.generation
  const scopedDispatch = useCallback(
    (action: ChatAction) => {
      if (identity.current.generation === identityGeneration) dispatch(action)
    },
    [identityGeneration]
  )

  useEffect(() => {
    dispatch({ type: 'RESET_CHAT' })
    setOwnerId(userId)
  }, [userId])

  // Mask previous-user data before effects clean up the old subscriptions.
  const visibleState = ownerId === userId ? state : initialState
  const history = useUserChats(userId, scopedDispatch)
  const messageStatus = useChatMessages(
    userId,
    visibleState.chatId,
    scopedDispatch
  )

  return (
    <ChatContext.Provider
      value={{
        state: visibleState,
        dispatch: scopedDispatch,
        auth: firebaseAuth,
        history,
        messageStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
