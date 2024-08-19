import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { FIREBASE_CONFIG, FIRESTORE_DB } from '@/utils/config'

// Constants
export const FIREBASE_INDEX_ERROR_NAME = 'FirebaseError'
export const FIREBASE_INDEX_CREATE_REQUIRED =
  'Index creation required. Please visit the following URL to create the necessary index:'
export const FIREBASE_INDEX_ERROR_CONTENT = 'The query requires an index'

// Firebase initialization
const app = initializeApp(FIREBASE_CONFIG)
export const auth = getAuth(app)
export const db = getFirestore(FIRESTORE_DB)
