/**
 * Action that logs in the current Cognito user using federated sign in.
 * @module actions/loginUserFederated
 */
import React from 'react'
import { signInWithRedirect } from 'aws-amplify/auth'
import { AuthActions } from '@/actions/actionTypes'

export default async function loginUserFederated(
  dispatch: React.Dispatch<{
    type: AuthActions
    payload?: unknown
    error?: Error
  }>
) {
  try {
    dispatch({ type: AuthActions.LOGIN_REQUEST })
    await signInWithRedirect()

    dispatch({ type: AuthActions.LOGIN_SUCCESS, payload: {} })
    return {}
  } catch (error) {
    dispatch({ type: AuthActions.LOGIN_FAILURE, error: error as Error })
  }
}
