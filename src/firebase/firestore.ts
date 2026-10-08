import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import type { Chat } from '@/types/chat'
import { db, auth } from '@/firebase'

const requireChatUser = (expectedUid: string): void => {
  if (!expectedUid || auth.currentUser?.uid !== expectedUid) {
    throw Object.assign(new Error('Chat authentication changed'), {
      code: 'chat/auth-changed',
    })
  }
}

export const createSession = async (): Promise<void> => {
  if (!auth?.currentUser) {
    return
  }
  const sessionRef = doc(db, 'sessions', auth.currentUser.uid)
  await setDoc(
    sessionRef,
    {
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    },
    { merge: true }
  )
}

export const createChat = async (expectedUid: string): Promise<string> => {
  requireChatUser(expectedUid)
  const chatRef = await addDoc(collection(db, 'chats'), {
    userId: expectedUid,
    createdAt: serverTimestamp(),
  })
  return chatRef.id
}

export const addMessageToChat = async (
  chatId: string,
  messageData: { body: string; from: string }
): Promise<void> => {
  requireChatUser(messageData.from)
  const messagesRef = collection(db, 'chats', chatId, 'messages')
  await addDoc(messagesRef, {
    body: messageData.body,
    from: messageData.from,
    createdAt: serverTimestamp(),
  })
}

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  )
  const querySnapshot = await getDocs(chatsQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Chat, 'id'>),
  }))
}
