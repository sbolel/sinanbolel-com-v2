/**
 * A component used in the app header that renders either a login
 * or logout button depending on the user's authentication status.
 * @module components/HeaderAuthButton
 * @exports HeaderAuthButton
 */
import { Link as RouterLink } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import useAuthState from '@/store/auth/useAuthState'
import { Routes } from '@/router/constants'

// ** Styled Components
const ButtonBox = styled(Box)({ mr: 1, ml: 1, pr: 1, pl: 1 })
const ButtonContainerBox = styled(Box)({ mr: 2, ml: 2, pr: 2, pl: 2 })

/**
 * Internal component for a login button to be rendered HeaderAuthButton.
 * @returns {React.JSX.Element} Button that navigates to login view on click.
 */
const LoginButton: React.FC = (): React.JSX.Element => (
  <ButtonBox>
    <Button
      component={RouterLink}
      to={Routes.AUTH_LOGIN}
      color="primary"
      variant="contained"
      role="button"
    >
      Login
    </Button>
  </ButtonBox>
)

/**
 * Internal component for a logout button to be rendered by HeaderAuthButton.
 * @returns {React.JSX.Element} Button that navigates to the logout route on click.
 */
const LogoutButton: React.FC = (): React.JSX.Element => {
  return (
    <ButtonBox>
      <Button
        component={RouterLink}
        to={Routes.AUTH_LOGOUT}
        color="primary"
        variant="contained"
        role="button"
      >
        Logout
      </Button>
    </ButtonBox>
  )
}

/**
 * A component that conditionally renders a login or a logout button based on
 *  the auth state. If auth state is not yet known, renders an empty container.
 * @returns {React.JSX.Element} Component containing a login or logout button.
 * @todo Fix the flashing of the login button when the user is already logged in.
 */
const HeaderAuthButton: React.FC = (): React.JSX.Element => {
  const { jwtToken } = useAuthState()

  // AuthContext.initAuth hasn't resolved yet, so don't render anything
  if (jwtToken === null) {
    return <ButtonContainerBox />
  }

  // session is defined, so render logout button
  if (jwtToken) {
    return (
      <ButtonContainerBox>
        <LogoutButton />
      </ButtonContainerBox>
    )
  }

  // session doesn't exist, so render login button
  return (
    <ButtonContainerBox>
      <LoginButton />
    </ButtonContainerBox>
  )
}

export default HeaderAuthButton
