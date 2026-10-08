import { useEffect, useState, useCallback } from 'react'
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import type { ChatAction } from '@/contexts/ChatContext'
import type { Message } from '@/types/chat'
import type { ChatLoadResult, ChatLoadState } from '@/hooks/chatStatus'
import { firebaseErrorCode, logFirebaseError } from '@/firebase/errors'

const useChatMessages = (
  userId: string | null,
  chatId: string | null,
  dispatch: React.Dispatch<ChatAction>
): ChatLoadResult => {
  const [state, setState] = useState<
    ChatLoadState & {
      userId: string | null
      chatId: string | null
    }
  >({ userId: null, chatId: null, status: 'idle', error: null })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let active = true
    if (!userId || !chatId) {
      setState({ userId, chatId, status: 'idle', error: null })
      return
    }
    setState({ userId, chatId, status: 'loading', error: null })
    const handleError = (error: unknown) => {
      if (!active) return
      logFirebaseError('load-chat-messages', error)
      setState({
        userId,
        chatId,
        status: 'error',
        error: firebaseErrorCode(error),
      })
    }
    let unsubscribe: (() => void) | undefined
    try {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      )
      unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          if (!active) return
          dispatch({
            type: 'SET_MESSAGES',
            payload: snapshot.docs.map((doc) => doc.data() as Message),
          })
          setState({ userId, chatId, status: 'ready', error: null })
        },
        handleError
      )
    } catch (error) {
      handleError(error)
    }
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [userId, chatId, dispatch, attempt])

  const current =
    state.userId === userId && state.chatId === chatId
      ? state
      : {
          status: userId && chatId ? ('loading' as const) : ('idle' as const),
          error: null,
        }
  return { status: current.status, error: current.error, retry }
}

export default useChatMessages
