/**
 * @module store/auth/AuthProvider
 */
import { Auth } from 'aws-amplify'
import { useCallback, useEffect, useReducer } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'
import { AuthActions } from '@/actions/actionTypes'
import AuthReducer from '@/store/auth/AuthReducer'
import { AuthProviderProps } from '@/store/auth/types'
import { INITIAL_STATE } from '@/store/auth/constants'
import AuthDispatchContext from '@/store/auth/AuthDispatchContext'
import AuthStateContext from '@/store/auth/AuthStateContext'
import { Routes } from '@/router/constants'

/**
 * The AuthContextProvider is used to provide user data to components.
 * @param {AuthProviderProps} props The input props passed to the component.
 * @param {React.ReactNode} props.children The children nodes being rendered.
 * @returns {React.JSX.Element} The rendered provider that wraps the children nodes.
 */
const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}): React.JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()
  const matchProtectedRoute = useMatch('/app/*')
  const [user, dispatch] = useReducer(AuthReducer, { ...INITIAL_STATE })

  /**
   * Async function to check the validity of the user session and set user state.
   * Extracted from useEffect and memoized with useCallback to properly handle dependencies.
   * @returns {Promise<void>} A promise that resolves when the user's session
   *  is resolved to a valid session, or rejects if no valid session exists.
   */
  const initAuth = useCallback(async () => {
    try {
      const [user, session] = await Promise.all([
        Auth.currentAuthenticatedUser(),
        Auth.currentSession(),
      ])

      if (!user || !session) {
        throw new Error('No user or session')
      }

      const jwtToken = session?.getAccessToken()?.getJwtToken()

      if (!jwtToken) {
        throw new Error('No jwtToken')
      }

      // TODO: implement refresh sessions
      // user.refreshSession(
      //   session.getRefreshToken(),
      //   async (err: any, session: CognitoUserSession) => {
      //     if (err) {
      //       throw err
      //     }
      //   }
      // )

      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { jwtToken },
      })

      // if the unauthenticated user is trying to navigate to a
      // protected app routue, redirect them to the login page.
      if (!matchProtectedRoute && location.pathname !== Routes.AUTH_LOGOUT) {
        // navigate(Routes.DASHBOARD)
      }
    } catch (error) {
      dispatch({
        type: AuthActions.LOGIN_FAILURE,
        error: error as Error,
      })
      // if the unauthenticated user is trying to navigate to a
      // protected app routue, redirect them to the login page.
      if (matchProtectedRoute) {
        // navigate(Routes.AUTH_LOGIN)
      }
    }
  }, [location?.pathname, matchProtectedRoute, navigate, dispatch])

  /**
   * Effect that initializes the AuthContext by checking for a user session
   *  and setting the user state accordingly. If no valid user session exists,
   *  it sets the user state to null and clears local storage.
   */
  useEffect(() => {
    initAuth()
  }, [initAuth])

  // set all the AuthContext values in the context provider.
  return (
    <AuthStateContext.Provider value={user}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider
