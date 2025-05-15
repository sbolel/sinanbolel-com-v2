import { useState, useEffect } from 'react'
import { auth } from '@/firebase'
import { User } from 'firebase/auth'

const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser)

  useEffect(() => {
    // Intentionally omitting dependency array items since we only want to
    // subscribe to auth state changes once on component mount
    // and clean up on unmount
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
    })

    return () => unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return currentUser
}

export default useFirebaseAuth
