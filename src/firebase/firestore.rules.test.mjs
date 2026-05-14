import { readFileSync } from 'node:fs'
import { after, afterEach, before, describe, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const projectId = `firestore-rules-${Date.now()}`
const rules = readFileSync('firestore.rules', 'utf8')

let testEnv

const authedDb = (uid) => testEnv.authenticatedContext(uid).firestore()
const seed = async (path, data) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data)
  })
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  })
})

afterEach(async () => {
  await testEnv.clearFirestore()
})

after(async () => {
  await testEnv.cleanup()
})

describe('Firestore security rules', () => {
  test('owner can read and write their own session', async () => {
    const db = authedDb('alice')
    const sessionRef = doc(db, 'sessions/alice')

    await assertSucceeds(
      setDoc(sessionRef, { createdAt: new Date(), lastActive: new Date() })
    )
    await assertSucceeds(getDoc(sessionRef))
  })

  test('non-owner cannot read or write another session', async () => {
    await seed('sessions/alice', {
      createdAt: new Date(),
      lastActive: new Date(),
    })

    const db = authedDb('bob')
    const sessionRef = doc(db, 'sessions/alice')

    await assertFails(getDoc(sessionRef))
    await assertFails(setDoc(sessionRef, { lastActive: new Date() }))
  })

  test('owner can create and read their chat', async () => {
    const db = authedDb('alice')
    const chatRef = doc(db, 'chats/alice-chat')

    await assertSucceeds(setDoc(chatRef, { userId: 'alice' }))
    await assertSucceeds(getDoc(chatRef))
  })

  test('non-owner cannot read another chat', async () => {
    await seed('chats/alice-chat', { userId: 'alice' })

    await assertFails(getDoc(doc(authedDb('bob'), 'chats/alice-chat')))
  })

  test('chat update and delete fail', async () => {
    await seed('chats/alice-chat', { userId: 'alice' })

    const chatRef = doc(authedDb('alice'), 'chats/alice-chat')

    await assertFails(updateDoc(chatRef, { userId: 'alice', title: 'Renamed' }))
    await assertFails(deleteDoc(chatRef))
  })

  test('owner can create and read messages in their own chat', async () => {
    await seed('chats/alice-chat', { userId: 'alice' })

    const db = authedDb('alice')
    const messageRef = doc(db, 'chats/alice-chat/messages/message-1')

    await assertSucceeds(
      setDoc(messageRef, {
        body: 'Hello',
        from: 'alice',
        createdAt: new Date(),
      })
    )
    await assertSucceeds(getDoc(messageRef))
  })

  test('non-owner cannot create messages in another user chat even when from matches their uid', async () => {
    await seed('chats/alice-chat', { userId: 'alice' })

    await assertFails(
      setDoc(doc(authedDb('bob'), 'chats/alice-chat/messages/message-1'), {
        body: 'Hello',
        from: 'bob',
        createdAt: new Date(),
      })
    )
  })

  test('message update and delete fail', async () => {
    await seed('chats/alice-chat', { userId: 'alice' })
    await seed('chats/alice-chat/messages/message-1', {
      body: 'Hello',
      from: 'alice',
      createdAt: new Date(),
    })

    const messageRef = doc(
      authedDb('alice'),
      'chats/alice-chat/messages/message-1'
    )

    await assertFails(updateDoc(messageRef, { body: 'Edited' }))
    await assertFails(deleteDoc(messageRef))
  })
})
