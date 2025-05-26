/**
 * @module views/SignIn/useSignIn
 */
import { Auth } from 'aws-amplify'
import { FederatedSignInOptions } from '@aws-amplify/auth/lib/types'
import { BaseSyntheticEvent, useCallback, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, UseFormHandleSubmit } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import loginUser from '@/actions/loginUser'
import useAlert from '@/hooks/useAlert'
import useAuthDispatch from '@/store/auth/useAuthDispatch'
import {
  TFieldValues,
  useSignInReturnType,
} from '@/views/SignIn/SignIn.interfaces'
import { Routes } from '@/router/constants'

// Define state interface and actions for auth state
type AuthState = {
  loading: boolean
  error: Error | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'LOGIN_FAILURE'; error: Error }
  | { type: 'SET_LOADING'; loading: boolean }

// Reducer to manage auth-related state in a batched way
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, error: null }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.error }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

/**
 * A custom hook to retrieve methods and state pertaining to the SignIn.
 * @returns {useSignInReturnType} All the methods and state required for the SignIn/SignOut Views.
 */
const useSignIn = (): useSignInReturnType => {
  const { setAlert } = useAlert()
  const dispatch = useAuthDispatch()
  const navigate = useNavigate()

  // Replace useState with useReducer for related state
  const [authState, authDispatch] = useReducer(authReducer, {
    loading: false,
    error: null,
  })

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const {
    clearErrors,
    control,
    formState,
    formState: { errors },
    handleSubmit: handleSubmitInternal,
    getFieldState,
    getValues,
    register,
    reset,
    resetField,
    setError,
    setFocus,
    setValue,
    trigger,
    unregister,
    watch,
    subscribe,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(
      yup.object().shape({
        email: yup
          .string()
          .email('Invalid email format')
          .required('Email is required'),
        password: yup
          .string()
          .min(8, 'Password must be at least 8 characters')
          .required('Password is required'),
      })
    ),
  })

  const handleFederatedSignIn = useCallback(async () => {
    try {
      await Auth.federatedSignIn({
        provider: 'COGNITO',
      } as FederatedSignInOptions)
    } catch (error) {
      setAlert({
        message: 'There was an error with the identity provider.',
        severity: 'error',
      })
    }
  }, [setAlert])

  const onSubmit = useCallback(
    async (data: TFieldValues) => {
      const { email, password } = data

      // Dispatch a single action to start login process - avoids multiple state updates
      authDispatch({ type: 'LOGIN_START' })

      try {
        await loginUser(dispatch, { email, password })
        // Dispatch a single action for success - avoids multiple state updates
        authDispatch({ type: 'LOGIN_SUCCESS' })
        navigate(Routes.DASHBOARD)
      } catch (error) {
        // Dispatch a single action for failure - combines error and loading state updates
        authDispatch({ type: 'LOGIN_FAILURE', error: error as Error })
        setAlert({
          message: 'There was an error logging in. Please try again.',
          severity: 'error',
        })
      }
    },
    [dispatch, navigate, setAlert]
  )

  // Create a setLoading function that uses the reducer
  const setLoading: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
    (value) => {
      const loading =
        typeof value === 'function' ? value(authState.loading) : value
      authDispatch({ type: 'SET_LOADING', loading })
    },
    [authState.loading, authDispatch]
  )

  return {
    loading: authState.loading,
    setLoading,
    showPassword,
    setShowPassword,
    control,
    errors,
    formState,
    clearErrors,
    getFieldState,
    getValues,
    handleFederatedSignIn,
    handleSubmit: handleSubmitInternal(onSubmit) as unknown as ((
      e?: BaseSyntheticEvent<unknown, unknown, unknown> | undefined
    ) => Promise<void>) &
      UseFormHandleSubmit<TFieldValues, TFieldValues>,
    register,
    reset,
    resetField,
    setError,
    setFocus,
    setValue,
    trigger,
    unregister,
    watch,
    subscribe,
  }
}

export default useSignIn
