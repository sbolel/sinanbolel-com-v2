import { useEffect } from 'react'
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { ChatAction } from '@/contexts/ChatContext'
import { Message } from '@/types/chat'

const useChatMessages = (
  chatId: string | null,
  dispatch: React.Dispatch<ChatAction>
) => {
  useEffect(() => {
    if (!chatId) return

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => doc.data() as Message)
      dispatch({ type: 'SET_MESSAGES', payload: messagesData })
    })

    return () => unsubscribe()
  }, [chatId, dispatch])
}

export default useChatMessages
