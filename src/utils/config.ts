/**
 * Set global configuration for the application provided by Vite environment variables
 * @module utils/config
 * @exports CONFIG - Global configuration object
 * @exports FIREBASE_CONFIG - Firebase configuration object
 */
import type { AppConfig, FirebaseConfig } from '@/types'

const CONFIG = {
  //* AWS configuration
  AWS_REGION: process.env.VITE_AWS_REGION || '',
  CF_DOMAIN: process.env.VITE_CF_DOMAIN || '',
  API_URL: process.env.VITE_CF_DOMAIN ? `${process.env.VITE_CF_DOMAIN}/api` : '',
  COGNITO_DOMAIN: process.env.VITE_COGNITO_DOMAIN || '',
  COGNITO_REDIRECT_SIGN_IN: process.env.VITE_COGNITO_REDIRECT_SIGN_IN || '',
  COGNITO_REDIRECT_SIGN_OUT: process.env.VITE_COGNITO_REDIRECT_SIGN_OUT || '',
  USER_POOL_CLIENT_ID: process.env.VITE_USER_POOL_CLIENT_ID || '',
  USER_POOL_ID: process.env.VITE_USER_POOL_ID || '',

  //* Feature flags
  IDP_ENABLED: process.env.VITE_IDP_ENABLED === 'true',
} satisfies AppConfig

export const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || '',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
} satisfies FirebaseConfig

export const FIRESTORE_DB = process.env.VITE_FIREBASE_FIRESTORE_CHAT || ''

export default CONFIG
