import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'
import { auth } from '@/firebase'
import { ensureFirebaseUser } from '@/firebase/auth'
import { firebaseErrorCode, logFirebaseError } from '@/firebase/errors'

export interface FirebaseAuthState {
  user: User | null
  status: 'initializing' | 'ready' | 'error'
  error: string | null
}

export interface FirebaseAuthResult extends FirebaseAuthState {
  retry: () => void
}

const useFirebaseAuth = (): FirebaseAuthResult => {
  const [state, setState] = useState<FirebaseAuthState>({
    user: null,
    status: 'initializing',
    error: null,
  })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let active = true
    let request = 0
    const initialize = async () => {
      const generation = ++request
      setState({ user: null, status: 'initializing', error: null })
      try {
        const user = await ensureFirebaseUser()
        if (
          active &&
          generation === request &&
          auth.currentUser?.uid === user.uid
        ) {
          setState({ user, status: 'ready', error: null })
        }
      } catch (error) {
        if (!active || generation !== request) return
        logFirebaseError('connect-chat', error)
        setState({
          user: null,
          status: 'error',
          error: firebaseErrorCode(error),
        })
      }
    }

    void initialize()
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!active) return
      if (user) {
        ++request
        setState({ user, status: 'ready', error: null })
      } else {
        void initialize()
      }
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [attempt])

  return { ...state, retry }
}

export default useFirebaseAuth
