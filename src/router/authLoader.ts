/**
 * Auth state loader for react-router data routes.
 * @module router/authLoader
 * @see {@link dashboard/Routes}
 */
import { redirect } from 'react-router'
import getJWT from '@/utils/getJWT'
import { Routes } from '@/router/constants'

export interface AuthLoaderData {
  jwtToken: string
}

const authLoader = async (): Promise<AuthLoaderData> => {
  try {
    const jwtToken = await getJWT()

    return { jwtToken }
  } catch (error) {
    if (error instanceof Response && [401, 403].includes(error.status)) {
      throw redirect(Routes.AUTH_LOGIN)
    }

    throw error
  }
}

export default authLoader
