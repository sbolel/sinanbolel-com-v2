import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

jest.unmock('@/firebase')
jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }))
jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }))
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }))
jest.mock('@/utils/config', () => ({
  FIREBASE_CONFIG: { projectId: 'demo-chat' },
  FIRESTORE_DB: '(default)',
}))

test('uses the same Firebase app for auth and the explicit chat database', () => {
  const app = { name: 'test-app' }
  ;(initializeApp as jest.Mock).mockReturnValue(app)
  jest.isolateModules(() => require('@/firebase'))
  expect(getAuth).toHaveBeenCalledWith(app)
  expect(getFirestore).toHaveBeenCalledWith(app, '(default)')
})
