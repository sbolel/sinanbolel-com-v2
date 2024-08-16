import { db, auth } from './config'
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'

export const createSession = async () => {
  if (auth.currentUser) {
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
}

export const createChat = async (message: string) => {
  if (auth.currentUser) {
    const chatRef = await addDoc(collection(db, 'chats'), {
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      messages: [
        {
          body: message,
          createdAt: new Date().toISOString(),
        },
      ],
    })
    return chatRef.id
  }
}

export const addMessageToChat = async (chatId: string, message: string) => {
  const chatRef = doc(db, 'chats', chatId)
  await updateDoc(chatRef, {
    messages: arrayUnion({
      body: message,
      createdAt: new Date().toISOString(),
    }),
  })
}

export const getUserChats = async (userId: string) => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  )
  const querySnapshot = await getDocs(chatsQuery)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
