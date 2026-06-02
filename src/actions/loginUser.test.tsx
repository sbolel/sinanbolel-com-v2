import { fetchAuthSession, fetchUserAttributes, signIn } from 'aws-amplify/auth'
import { AuthActions } from '@/actions/actionTypes'
import loginUser from '@/actions/loginUser'

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
  fetchUserAttributes: jest.fn(),
  signIn: jest.fn(),
}))

const mockDispatch = jest.fn()

describe('loginUser action', () => {
  const payload = { email: 'test@test.com', password: 'password' }
  const signInFn = signIn as jest.MockedFunction<typeof signIn>
  const sessionFn = fetchAuthSession as jest.MockedFunction<
    typeof fetchAuthSession
  >
  const userAttributesFn = fetchUserAttributes as jest.MockedFunction<
    typeof fetchUserAttributes
  >

  beforeEach(() => {
    jest.resetAllMocks()

    signInFn.mockResolvedValue({
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' },
    })
    sessionFn.mockResolvedValue({
      tokens: {
        accessToken: { toString: () => 'jwtToken' },
      },
    })
    userAttributesFn.mockResolvedValue({
      email: payload.email,
      preferred_username: 'username',
    })
  })

  test('dispatches LOGIN_REQUEST action', async () => {
    await loginUser(mockDispatch, payload)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_REQUEST,
    })
  })

  test('calls Auth.signIn and Auth.currentSession on successful login', async () => {
    await loginUser(mockDispatch, payload)
    expect(signIn).toHaveBeenCalledWith({
      username: payload.email,
      password: payload.password,
    })
    expect(fetchAuthSession).toHaveBeenCalled()
  })

  test('dispatches LOGIN_SUCCESS action on successful login with the correct payload', async () => {
    await loginUser(mockDispatch, payload)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_SUCCESS,
      payload: {
        jwtToken: 'jwtToken',
        email: payload.email,
        username: 'username',
      },
    })
  })

  test('dispatches LOGIN_FAILURE action on failed login', async () => {
    signInFn.mockRejectedValue(new Error('Login failed'))
    await loginUser(mockDispatch, payload)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_FAILURE,
      error: new Error('Login failed'),
    })
  })

  test('dispatches LOGIN_FAILURE action if the session is not valid', async () => {
    sessionFn.mockResolvedValue({})
    await loginUser(mockDispatch, payload)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_FAILURE,
      error: new Error('Invalid user session'),
    })
  })

  test('dispatches LOGIN_FAILURE action if the jwtToken is not valid', async () => {
    sessionFn.mockResolvedValue({
      tokens: {
        accessToken: { toString: () => '' },
      },
    })
    await loginUser(mockDispatch, payload)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_FAILURE,
      error: new Error('No JWT token'),
    })
  })

  test('dispatches LOGIN_FAILURE action if the user object is not valid', async () => {
    signInFn.mockResolvedValue({
      isSignedIn: false,
      nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_PASSWORD' },
    })
    await loginUser(mockDispatch, payload)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_FAILURE,
      error: new Error('Invalid user'),
    })
  })
})
