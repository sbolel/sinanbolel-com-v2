/**
 * The view at the /login route that renders the sign in form.
 * @module views/SignIn/SignIn
 */
import React, { memo, ReactNode, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import InputFormControl from '@/components/forms/InputFormControl'
import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop'
import PasswordVisibilityToggle from '@/components/PasswordVisibilityToggle'
import SubmitButton from '@/components/forms/SubmitButton'
import BlankLayout from '@/layouts/BlankLayout'
import useSignIn from '@/views/SignIn/useSignIn'
import {
  BoxWrapper,
  CenteredFlexBox,
  LoginIllustrationWrapper,
  RightWrapper,
  SignInGraphic,
  VerticalCenteredFlexBox,
} from '@/views/SignIn/SignIn.components'
import { TContext, TFieldValues } from '@/views/SignIn/SignIn.interfaces'
import {
  PUBLIC_APP_NAME,
  SIGN_IN_CTA,
  SIGN_IN_CTA_IDP,
  SIGN_IN_DIRECTIONS,
  SIGN_IN_EMAIL_PLACEHOLDER,
  SIGN_IN_GREETING,
} from '@/locales/en'
import CONFIG from '@/utils/config'

// Extract LoadingIcon into a separate memoized component
const LoadingIcon = memo(function LoadingIcon() {
  const { loading = false } = useSignIn()
  const { breakpoints } = useTheme()
  const hidden = useMediaQuery(breakpoints.down('md'))

  if (!loading) return null

  return (
    <Backdrop
      open={loading}
      style={{ marginTop: 0 }}
      sx={{
        borderRadius: hidden ? 2 : 0,
        position: 'absolute',
      }}
    >
      <CircularProgress data-testid="linear-indeterminate" />
    </Backdrop>
  )
})

// Extract PasswordToggle into a proper memoized component
const PasswordToggle = memo(function PasswordToggle({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean
  setShowPassword: (show: boolean) => void
}) {
  return (
    <PasswordVisibilityToggle
      showPassword={showPassword}
      setShowPassword={setShowPassword}
    />
  )
})

// Extract SignInForm into a separate memoized component
const SignInForm = memo(function SignInForm() {
  const {
    control,
    loading,
    handleFederatedSignIn,
    handleSubmit,
    showPassword,
    setShowPassword,
  } = useSignIn()

  // Memoize the form content
  const formContent = useMemo(
    () => (
      <>
        <InputFormControl<TFieldValues, TContext>
          control={control}
          name="email"
          InputProps={{
            autoComplete: 'username',
            placeholder: SIGN_IN_EMAIL_PLACEHOLDER,
          }}
        />
        <InputFormControl<TFieldValues, TContext>
          control={control}
          name="password"
          InputProps={{
            autoComplete: 'current-password',
            endAdornment: (
              <PasswordToggle
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            ),
            type: showPassword ? 'text' : 'password',
          }}
        />
        <SubmitButton disabled={loading} fullWidth name="login" role="button">
          {SIGN_IN_CTA}
        </SubmitButton>
        <LoadingIcon />
        {CONFIG.IDP_ENABLED && (
          <>
            <Typography align="center" variant="subtitle2">
              or...
            </Typography>
            <Button
              fullWidth
              onClick={handleFederatedSignIn}
              role="button"
              variant="outlined"
            >
              {SIGN_IN_CTA_IDP}
            </Button>
          </>
        )}
      </>
    ),
    [control, loading, handleFederatedSignIn, showPassword, setShowPassword]
  )

  return (
    <Stack
      component="form"
      id="login-form"
      role="form"
      autoComplete="off"
      onSubmit={handleSubmit}
      spacing={3}
    >
      {formContent}
    </Stack>
  )
})

/**
 * Component that renders the page containing the sign in form.
 * @returns {React.JSX.Element} component that renders the the sign in form.
 */
const SignIn = (): React.JSX.Element => {
  const { breakpoints } = useTheme()
  const hidden = useMediaQuery(breakpoints.down('md'))

  // Memoize logo component
  const LogoComponent = useMemo(() => {
    if (hidden) return null

    return (
      <CenteredFlexBox
        sx={{
          position: 'absolute',
          left: 40,
          top: 30,
        }}
      >
        <SignInGraphic />
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.5rem !important',
            lineHeight: 1,
            ml: 2,
          }}
        >
          {PUBLIC_APP_NAME}
        </Typography>
      </CenteredFlexBox>
    )
  }, [hidden])

  return (
    <BoxWrapper
      id="box-wrapper"
      sx={{
        height: '100%',
        position: 'relative',
      }}
    >
      {hidden === false && (
        <CenteredFlexBox sx={{ flex: 1, position: 'relative' }}>
          <LoginIllustrationWrapper />
        </CenteredFlexBox>
      )}
      <RightWrapper hidden={hidden}>
        <CenteredFlexBox
          sx={{
            backgroundColor: 'background.paper',
            flexFlow: 'column',
            height: '100%',
            p: 7,
          }}
        >
          {LogoComponent}
          <VerticalCenteredFlexBox>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5">{`${SIGN_IN_GREETING} 👋🏻`}</Typography>
              <Typography variant="body2">{SIGN_IN_DIRECTIONS}</Typography>
            </Box>
            <SignInForm />
          </VerticalCenteredFlexBox>
        </CenteredFlexBox>
      </RightWrapper>
    </BoxWrapper>
  )
}

SignIn.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default memo(SignIn)
