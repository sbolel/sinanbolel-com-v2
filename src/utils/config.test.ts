const previous = process.env.VITE_FIREBASE_FIRESTORE_CHAT
afterEach(() => {
  if (previous === undefined) delete process.env.VITE_FIREBASE_FIRESTORE_CHAT
  else process.env.VITE_FIREBASE_FIRESTORE_CHAT = previous
})

test.each([undefined, ''])(
  'defaults chat to (default) for an unset or empty selector',
  (value) => {
    if (value === undefined) delete process.env.VITE_FIREBASE_FIRESTORE_CHAT
    else process.env.VITE_FIREBASE_FIRESTORE_CHAT = value
    jest.isolateModules(() => {
      expect(require('./config').FIRESTORE_DB).toBe('(default)')
    })
  }
)

test('retains an explicitly configured development database', () => {
  process.env.VITE_FIREBASE_FIRESTORE_CHAT = 'development-chat'
  jest.isolateModules(() => {
    expect(require('./config').FIRESTORE_DB).toBe('development-chat')
  })
})
