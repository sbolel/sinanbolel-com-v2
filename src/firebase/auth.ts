import { signInAnonymously, type User } from 'firebase/auth'
import { auth } from '@/firebase'
import { createSession } from '@/firebase/firestore'
import { logFirebaseError } from '@/firebase/errors'

let pendingInitialization: Promise<User> | null = null

export const ensureFirebaseUser = (): Promise<User> => {
  if (pendingInitialization) return pendingInitialization

  const initialize = async (): Promise<User> => {
    await auth.authStateReady()
    if (auth.currentUser) return auth.currentUser

    const { user } = await signInAnonymously(auth)
    // Session bookkeeping must not block a successfully authenticated visitor.
    void createSession().catch((error: unknown) => {
      logFirebaseError('create-session', error)
    })
    return user
  }

  const initialization = initialize()
  pendingInitialization = initialization
  const clearPending = () => {
    if (pendingInitialization === initialization) pendingInitialization = null
  }
  void initialization.then(clearPending, clearPending)
  return initialization
}
