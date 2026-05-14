/**
 * Action that logs in a user with the given email and password
 * @module actions/loginUser
 */
import React from 'react'
import { fetchAuthSession, fetchUserAttributes, signIn } from 'aws-amplify/auth'
import { AuthActions } from '@/actions/actionTypes'
import { LoginParams } from '@/hooks/types'
import { AuthActionParams } from '@/store/auth/types'

type UserData = {
  jwtToken: string
  email: string
  username: string
}

export default async function loginUser(
  dispatch: React.Dispatch<AuthActionParams>,
  payload: LoginParams
): Promise<UserData | undefined> {
  try {
    dispatch({ type: AuthActions.LOGIN_REQUEST })
    const signInOutput = await signIn({
      username: payload.email,
      password: payload.password,
    })

    if (!signInOutput.isSignedIn) {
      throw new Error('Invalid user')
    }

    const [session, attributes] = await Promise.all([
      fetchAuthSession(),
      fetchUserAttributes(),
    ])

    if (!session.tokens) {
      throw new Error('Invalid user session')
    }

    const jwtToken = session.tokens.accessToken.toString()

    // If we don't have a jwtToken, throw an error
    if (!jwtToken) {
      throw new Error('No JWT token')
    }

    const data: UserData = {
      jwtToken,
      email: attributes.email ?? payload.email,
      username:
        attributes.preferred_username ?? attributes.email ?? payload.email,
    }
    dispatch({ type: AuthActions.LOGIN_SUCCESS, payload: data })
    return data
  } catch (error) {
    dispatch({ type: AuthActions.LOGIN_FAILURE, error: error as Error })
  }
}
