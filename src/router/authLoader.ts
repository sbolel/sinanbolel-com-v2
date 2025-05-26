/**
 * Auth state loader for react-router data routes.
 * @module router/authLoader
 * @see {@link dashboard/Routes}
 */
import { json } from 'react-router-dom'
import getJWT from '@/utils/getJWT'

const authLoader = async (): Promise<unknown> =>
  json({
    jwtToken: getJWT(),
  })

export default authLoader
