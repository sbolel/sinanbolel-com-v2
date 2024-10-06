import { useEffect } from 'react'
import { auth } from '@/firebase'
import { getUserChats } from '@/firebase/firestore'
import { ChatAction } from '@/contexts/ChatContext'

const useUserChats = (dispatch: React.Dispatch<ChatAction>) => {
  useEffect(() => {
    const fetchUserChats = async () => {
      if (auth.currentUser) {
        try {
          const userChats = await getUserChats(auth.currentUser.uid)
          if (userChats.length > 0) {
            dispatch({ type: 'SET_CHAT_ID', payload: userChats[0].id })
          }
        } catch (error) {
          console.error('Error fetching user chats:', error)
        }
      }
    }
    fetchUserChats()
  }, [dispatch])
}

export default useUserChats
