/**
 * @module views/SignIn/SignIn.interfaces
 */

import { BaseSyntheticEvent, Dispatch, SetStateAction } from 'react'
import { FieldErrors, UseFormReturn, Control } from 'react-hook-form'

export interface FormData {
  email: string
  password: string
}

export type TContext = Record<string, unknown>

export type TFieldValues = {
  email: string
  password: string
}

export type useSignInReturnType = {
  control: Control<TFieldValues, TContext>
  errors: FieldErrors<{
    email: string
    password: string
  }>
  handleFederatedSignIn: () => Promise<void>
  handleSubmit: (
    e?: BaseSyntheticEvent<unknown, unknown, unknown> | undefined
  ) => Promise<void>
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  showPassword: boolean
  setShowPassword: Dispatch<SetStateAction<boolean>>
} & UseFormReturn<TFieldValues, TContext, TFieldValues>
