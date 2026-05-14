import { signOut } from 'aws-amplify/auth'
import { act } from '@testing-library/react'
import { AuthActions } from '@/actions/actionTypes'
import logoutUser from '@/actions/logoutUser'

jest.mock('aws-amplify/auth', () => ({
  signOut: jest.fn(),
}))

/**
 * Helper function to provide a mock dispatch function for our tests
 */
function useMockDispatch() {
  const dispatch = jest.fn()
  // Simulate calling the logoutUser function
  function doLogout() {
    act(() => {
      logoutUser(dispatch)
    })
  }
  return { dispatch, doLogout }
}

describe('logoutUser action', () => {
  test('calls Auth.signOut', async () => {
    const { doLogout } = useMockDispatch()
    await doLogout()
    expect(signOut).toHaveBeenCalled()
  })

  test('dispatches LOGOUT action', async () => {
    const { dispatch, doLogout } = useMockDispatch()
    await doLogout()
    expect(dispatch).toHaveBeenCalledWith({ type: AuthActions.LOGOUT })
  })
})
