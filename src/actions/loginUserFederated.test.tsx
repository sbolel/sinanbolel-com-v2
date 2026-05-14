import { signInWithRedirect } from 'aws-amplify/auth'
import { AuthActions } from '@/actions/actionTypes'
import loginUserFederated from '@/actions/loginUserFederated'

jest.mock('aws-amplify/auth', () => ({
  signInWithRedirect: jest.fn(),
}))

describe('loginUserFederated', () => {
  let mockDispatch: jest.Mock

  beforeEach(() => {
    mockDispatch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('dispatches LOGIN_REQUEST action', async () => {
    ;(signInWithRedirect as jest.Mock).mockResolvedValue(undefined)

    await loginUserFederated(mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_REQUEST,
    })
  })

  test('dispatches LOGIN_SUCCESS action when login is successful', async () => {
    ;(signInWithRedirect as jest.Mock).mockResolvedValue(undefined)

    await loginUserFederated(mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_SUCCESS,
      payload: {},
    })
  })

  test('dispatches LOGIN_FAILURE action when login fails', async () => {
    const mockError = new Error('login failed')

    ;(signInWithRedirect as jest.Mock).mockRejectedValue(mockError)

    await loginUserFederated(mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: AuthActions.LOGIN_FAILURE,
      error: mockError,
    })
  })

  test('calls signInWithRedirect', async () => {
    ;(signInWithRedirect as jest.Mock).mockResolvedValue(undefined)
    await loginUserFederated(mockDispatch)
    expect(signInWithRedirect).toHaveBeenCalled()
  })
})
