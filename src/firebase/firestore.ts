import { db, auth } from './config'
import { collection, addDoc, doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'

export const createSession = async () => {
  if (auth.currentUser) {
    const sessionRef = doc(db, 'sessions', auth.currentUser.uid)
    await setDoc(sessionRef, {
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    })
  }
}

export const createChat = async (message: string) => {
  if (auth.currentUser) {
    const chatRef = await addDoc(collection(db, 'chats'), {
      sessionId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      messages: [{
        body: message,
        createdAt: serverTimestamp(),
      }],
    })
    return chatRef.id
  }
}

export const addMessageToChat = async (chatId: string, message: string) => {
  const chatRef = doc(db, 'chats', chatId)
  await updateDoc(chatRef, {
    messages: arrayUnion({
      body: message,
      createdAt: serverTimestamp(),
    }),
  })
}
