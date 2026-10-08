import { auth, db } from '@/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { createChat, addMessageToChat } from './firestore'

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(() => 'collection'),
  serverTimestamp: jest.fn(() => 'server-time'),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))

beforeEach(() => {
  ;(auth as any).currentUser = { uid: 'owner' }
  ;(collection as jest.Mock).mockReturnValue('collection')
  ;(serverTimestamp as jest.Mock).mockReturnValue('server-time')
  ;(addDoc as jest.Mock).mockResolvedValue({ id: 'chat-id' })
})

test('creates a chat for the expected authenticated user', async () => {
  await expect(createChat('owner')).resolves.toBe('chat-id')
  expect(addDoc).toHaveBeenCalledWith('collection', {
    userId: 'owner',
    createdAt: 'server-time',
  })
})

test.each([null, { uid: 'other' }])(
  'rejects chat creation after auth disappears or changes: %p',
  async (current) => {
    ;(auth as any).currentUser = current
    await expect(createChat('owner')).rejects.toMatchObject({
      code: 'chat/auth-changed',
    })
    expect(addDoc).not.toHaveBeenCalled()
  }
)

test('writes the canonical message contract using a server timestamp', async () => {
  await addMessageToChat('chat-id', { body: 'Hello', from: 'owner' })
  expect(collection).toHaveBeenCalledWith(db, 'chats', 'chat-id', 'messages')
  expect(addDoc).toHaveBeenCalledWith('collection', {
    body: 'Hello',
    from: 'owner',
    createdAt: 'server-time',
  })
})

test('rejects a message after the authenticated UID changes', async () => {
  ;(auth as any).currentUser = { uid: 'other' }
  await expect(
    addMessageToChat('chat-id', { body: 'Hello', from: 'owner' })
  ).rejects.toMatchObject({ code: 'chat/auth-changed' })
  expect(addDoc).not.toHaveBeenCalled()
})
