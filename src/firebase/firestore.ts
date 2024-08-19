import { type FirebaseError } from 'firebase/app'
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
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

export const createChat = async (
  message: string
): Promise<string | undefined> => {
  if (!auth?.currentUser) {
    return
  }
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

export const addMessageToChat = async (
  chatId: string,
  message: string
): Promise<void> => {
  const chatRef = doc(db, 'chats', chatId)
  await updateDoc(chatRef, {
    messages: arrayUnion({
      body: message,
      createdAt: new Date().toISOString(),
    }),
  })
}

// TODO: add return type
export const getUserChats = async (userId: string) => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const querySnapshot = await getDocs(chatsQuery)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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
