import { firebaseErrorCode, logFirebaseError } from './errors'

test('logs only operation names and safe error codes', () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  logFirebaseError('send-chat-message', {
    code: 'permission-denied',
    message: 'private body and token',
  })
  logFirebaseError('connect-chat', {
    code: 'token=secret',
    message: 'private body',
  })
  expect(log.mock.calls).toEqual([
    ['send-chat-message', 'permission-denied'],
    ['connect-chat', 'unknown'],
  ])
  expect(firebaseErrorCode(new Error('private'))).toBe('unknown')
  log.mockRestore()
})
