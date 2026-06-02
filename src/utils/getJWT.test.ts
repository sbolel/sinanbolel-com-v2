import { fetchAuthSession } from 'aws-amplify/auth'
import { AuthErrorStatus } from '@/errors/AuthError'
import getJWT from '@/utils/getJWT'

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('returns the JWT token when the session is valid', async () => {
  const mockSession = {
    tokens: {
      accessToken: { toString: jest.fn().mockReturnValue('123456') },
    },
  }
  ;(fetchAuthSession as jest.Mock).mockResolvedValue(mockSession)
  await expect(getJWT()).resolves.toBe('123456')
  expect(fetchAuthSession).toHaveBeenCalled()
  expect(mockSession.tokens.accessToken.toString).toHaveBeenCalled()
})

test('returns a 401 Response when the session is invalid', async () => {
  const mockSession = {
    tokens: {
      accessToken: { toString: jest.fn().mockReturnValue('') },
    },
  }
  ;(fetchAuthSession as jest.Mock).mockResolvedValue(mockSession)
  const promise = getJWT()
  await expect(promise).rejects.toBeInstanceOf(Response)
  await expect(promise).rejects.toHaveProperty(
    'status',
    AuthErrorStatus.UNAUTHORIZED
  )
})
