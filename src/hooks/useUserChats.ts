import { useEffect, useState, useCallback } from 'react'
import { getUserChats } from '@/firebase/firestore'
import type { ChatAction } from '@/contexts/ChatContext'
import type { ChatLoadResult, ChatLoadState } from '@/hooks/chatStatus'
import { firebaseErrorCode, logFirebaseError } from '@/firebase/errors'

const useUserChats = (
  userId: string | null,
  dispatch: React.Dispatch<ChatAction>
): ChatLoadResult => {
  const [state, setState] = useState<ChatLoadState & { userId: string | null }>(
    {
      userId: null,
      status: 'idle',
      error: null,
    }
  )
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let active = true
    if (!userId) {
      setState({ userId, status: 'idle', error: null })
      return
    }
    setState({ userId, status: 'loading', error: null })
    const fetchChats = async () => {
      try {
        const chats = await getUserChats(userId)
        if (!active) return
        dispatch({ type: 'SET_CHAT_ID', payload: chats[0]?.id ?? null })
        setState({ userId, status: 'ready', error: null })
      } catch (error) {
        if (!active) return
        logFirebaseError('load-chat-history', error)
        setState({ userId, status: 'error', error: firebaseErrorCode(error) })
      }
    }
    void fetchChats()
    return () => {
      active = false
    }
  }, [userId, dispatch, attempt])

  const current =
    state.userId === userId
      ? state
      : {
          status: userId ? ('loading' as const) : ('idle' as const),
          error: null,
        }
  return { status: current.status, error: current.error, retry }
}

export default useUserChats
