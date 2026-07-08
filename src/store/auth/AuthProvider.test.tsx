import { useContext } from 'react'
import { screen, render, act, waitFor } from '@testing-library/react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'
import AuthProvider from '@/store/auth/AuthProvider'
import AuthStateContext from '@/store/auth/AuthStateContext'

const AuthStateProbe = () => {
  const authState = useContext(AuthStateContext)

  return (
    <>
      <div data-testid="jwt-token">{authState.jwtToken ?? ''}</div>
      <div data-testid="auth-error">{authState.error?.message ?? ''}</div>
    </>
  )
}

const Content = () => (
  <AuthProvider>
    <div>Child component</div>
    <AuthStateProbe />
  </AuthProvider>
)

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
  getCurrentUser: jest.fn(),
}))

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockFetchAuthSession = fetchAuthSession as jest.MockedFunction<
  typeof fetchAuthSession
>

const mockSession = (jwtToken: string) => ({
  tokens: {
    accessToken: {
      toString: () => jwtToken,
    },
  },
})

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue({
      username: 'test',
      userId: 'test',
    })
    mockFetchAuthSession.mockResolvedValue(mockSession('mockJwtToken'))
  })

  test('renders the children', async () => {
    render(<Content />)
    await flushEffects()
    expect(screen.getByText('Child component')).toBeInTheDocument()
  })

  test('initializes the AuthContext on mount', async () => {
    render(<Content />)
    await flushEffects()

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
      expect(mockFetchAuthSession).toHaveBeenCalledTimes(2)
      expect(mockFetchAuthSession).toHaveBeenNthCalledWith(2, {
        forceRefresh: true,
      })
    })
  })

  test('handles initialization error', async () => {
    const mockError = new Error('Initialization error')
    mockGetCurrentUser.mockRejectedValue(mockError)

    render(<Content />)
    await flushEffects()

    expect(mockGetCurrentUser).toHaveBeenCalled()
    expect(mockFetchAuthSession).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('auth-error')).toHaveTextContent(
      'Initialization error'
    )
  })

  test('dispatches login success with the refreshed jwt token when one is returned', async () => {
    const accessToken = { toString: () => 'staleJwtToken' }
    const refreshedAccessToken = { toString: () => 'freshJwtToken' }
    mockFetchAuthSession
      .mockResolvedValueOnce({
        tokens: {
          accessToken,
        },
      } as never)
      .mockResolvedValueOnce({
        tokens: {
          accessToken: refreshedAccessToken,
        },
      } as never)
    render(<Content />)
    await flushEffects()

    await waitFor(() => {
      expect(screen.getByTestId('jwt-token')).toHaveTextContent('freshJwtToken')
    })
  })
})
