import { screen, render, act, waitFor } from '@testing-library/react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'
import { AuthActions } from '@/actions/actionTypes'
import AuthProvider from '@/store/auth/AuthProvider'
import AuthDispatchContext from '@/store/auth/AuthDispatchContext'
import AuthStateContext from '@/store/auth/AuthStateContext'
import { Routes } from '@/router/constants'

const Content = () => (
  <AuthProvider>
    <div>Child component</div>
  </AuthProvider>
)

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useMatch: jest.fn(),
  useNavigate: jest.fn(),
}))
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
  let mockDispatch: jest.Mock
  let mockNavigate: jest.Mock
  let mockUseLocation: jest.Mock
  let mockUseMatch: jest.Mock
  let mockUseNavigate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch = jest.fn()
    mockNavigate = jest.fn()
    mockUseLocation = useLocation as jest.Mock
    mockUseMatch = useMatch as jest.Mock
    mockUseNavigate = useNavigate as jest.Mock
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseLocation.mockReturnValue({ pathname: Routes.AUTH_LOGIN })
    mockUseMatch.mockReturnValue(null)
    mockGetCurrentUser.mockResolvedValue({
      username: 'test',
      userId: 'test',
    })
    mockFetchAuthSession.mockResolvedValue(mockSession('mockJwtToken'))
  })

  test('renders the children', async () => {
    await act(async () => {
      render(<Content />)
    })
    expect(screen.getByText('Child component')).toBeInTheDocument()
    expect(mockUseLocation).toHaveBeenCalled()
    expect(mockUseMatch).toHaveBeenCalled()
    expect(mockUseNavigate).toHaveBeenCalled()
  })

  test('initializes the AuthContext on mount', async () => {
    const mockLocation = { pathname: Routes.AUTH_LOGIN }
    const mockMatch = { path: Routes.DASHBOARD }
    const mockState = { jwtToken: 'mockJwtToken' }

    mockUseLocation.mockReturnValue(mockLocation)
    mockUseMatch.mockReturnValue(mockMatch)

    await act(async () => {
      render(
        <AuthStateContext.Provider value={mockState}>
          <AuthDispatchContext.Provider value={mockDispatch}>
            <Content />
          </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
      )
    })

    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith({
        type: AuthActions.LOGIN_SUCCESS,
        payload: structuredClone(mockState),
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  test('handles initialization error', async () => {
    const mockLocation = { pathname: Routes.DASHBOARD }
    const mockMatch = { path: Routes.DASHBOARD }
    const mockState = { jwtToken: 'test' }
    const mockError = new Error('Initialization error')

    mockUseLocation.mockReturnValue(mockLocation)
    mockUseMatch.mockReturnValue(mockMatch)

    await act(async () => {
      render(
        <AuthStateContext.Provider value={mockState}>
          <AuthDispatchContext.Provider value={mockDispatch}>
            <Content />
          </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
      )
    })

    waitFor(() => {
      expect(mockUseLocation).toHaveBeenCalled()
      expect(mockUseMatch).toHaveBeenCalled()
      expect(mockUseNavigate).toHaveBeenCalled()
      expect(mockGetCurrentUser).toHaveBeenCalled()
      expect(mockFetchAuthSession).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith({
        type: AuthActions.LOGIN_FAILURE,
        error: mockError,
      })
      expect(mockNavigate).toHaveBeenCalledWith(Routes.AUTH_LOGIN)
    })
  })

  test(`redirects to ${Routes.DASHBOARD} when user is authenticated and on ${Routes.AUTH_LOGIN}`, async () => {
    const mockLocation = { pathname: Routes.AUTH_LOGIN }
    const mockMatch = null
    const mockState = { jwtToken: 'test' }

    mockUseLocation.mockReturnValue(mockLocation)
    mockUseMatch.mockReturnValue(mockMatch)

    mockGetCurrentUser.mockResolvedValue({
      username: 'test',
      userId: 'test',
    })
    mockFetchAuthSession.mockResolvedValue(mockSession('123456'))

    await act(async () => {
      render(
        <AuthStateContext.Provider value={mockState}>
          <AuthDispatchContext.Provider value={mockDispatch}>
            <Content />
          </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
      )
    })

    waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(Routes.DASHBOARD)
    })
  })

  test(`redirects to ${Routes.AUTH_LOGIN} when user is not authenticated and on protected route`, async () => {
    const mockLocation = { pathname: Routes.DASHBOARD }
    const mockMatch = { path: Routes.DASHBOARD }

    mockUseLocation.mockReturnValue(mockLocation)
    mockUseMatch.mockReturnValue(mockMatch)

    mockGetCurrentUser.mockRejectedValue(new Error('No user or session'))

    act(() => {
      render(
        <AuthDispatchContext.Provider value={mockDispatch}>
          <Content />
        </AuthDispatchContext.Provider>
      )
    })

    waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(Routes.AUTH_LOGIN)
    })
  })

  test(`redirects to ${Routes.AUTH_LOGIN} if the current session does not get a valid jwtToken`, async () => {
    mockFetchAuthSession.mockResolvedValue(mockSession(''))

    mockUseLocation.mockReturnValue({ pathname: Routes.DASHBOARD })
    mockUseMatch.mockReturnValue({ path: Routes.DASHBOARD })

    await act(async () => {
      render(
        <AuthDispatchContext.Provider value={mockDispatch}>
          <Content />
        </AuthDispatchContext.Provider>
      )
    })

    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith({
        type: AuthActions.LOGIN_FAILURE,
        error: new Error('Initialization error'),
      })
      expect(mockNavigate).toHaveBeenCalledWith(Routes.AUTH_LOGIN)
    })
  })

  test(`does not redirect when user is not authenticated and on ${Routes.AUTH_LOGIN}`, async () => {
    mockUseLocation.mockReturnValue({ pathname: Routes.AUTH_LOGIN })
    mockUseMatch.mockReturnValue(null)

    await act(async () => {
      render(
        <AuthDispatchContext.Provider value={mockDispatch}>
          <Content />
        </AuthDispatchContext.Provider>
      )
    })

    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(2)
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
