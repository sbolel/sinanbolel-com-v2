import { useState, useEffect } from 'react'
import { auth } from '@/firebase'
import { User } from 'firebase/auth'

const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
    })

    return () => unsubscribe()
  }, [])

  return currentUser
}

export default useFirebaseAuth
