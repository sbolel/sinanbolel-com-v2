import { type FirebaseError } from 'firebase/app'
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
import {
  db,
  auth,
  FIREBASE_INDEX_CREATE_REQUIRED,
  FIREBASE_INDEX_ERROR_CONTENT,
  FIREBASE_INDEX_ERROR_NAME,
} from '@/firebase'

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

export const createChat = async (): Promise<string | undefined> => {
  if (!auth?.currentUser) {
    return
  }
  const chatRef = await addDoc(collection(db, 'chats'), {
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  })
  return chatRef.id
}

export const addMessageToChat = async (
  chatId: string,
  messageData: { body: string; from: string }
): Promise<void> => {
  const messagesRef = collection(db, 'chats', chatId, 'messages')
  await addDoc(messagesRef, {
    body: messageData.body,
    from: messageData.from,
    createdAt: serverTimestamp(),
  })
}

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
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
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === FIREBASE_INDEX_ERROR_NAME &&
      error.message.includes(FIREBASE_INDEX_ERROR_CONTENT)
    ) {
      console.error(
        `[${(error as FirebaseError).code}] ${FIREBASE_INDEX_CREATE_REQUIRED}`
      )
    }
    throw error
  }
}
