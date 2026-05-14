/**
 * Configures Amazon Cognito auth in the root loader of the router.
 * @module utils/configureCognito
 * @see {@link dashboard/router/routes.tsx}
 */
/**
 * Configures Amazon Cognito auth in the root loader of the router.
 * @see {@link dashboard/craco.config.js}.
 */
import { Amplify } from 'aws-amplify'
import CONFIG from '@/utils/config'

const requiredConfig = (value: string, name: string): string => {
  if (!value) {
    throw new Error(`${name} is not defined`)
  }

  return value
}

function configureCognito(): null {
  const options = {
    userPoolId: requiredConfig(CONFIG.USER_POOL_ID, 'USER_POOL_ID'),
    userPoolClientId: requiredConfig(
      CONFIG.USER_POOL_CLIENT_ID,
      'USER_POOL_CLIENT_ID'
    ),
  }

  const oauth = {
    domain: requiredConfig(CONFIG.COGNITO_DOMAIN, 'COGNITO_DOMAIN'),
    scopes: ['openid', 'email', 'profile'],
    redirectSignIn: [CONFIG.COGNITO_REDIRECT_SIGN_IN],
    redirectSignOut: [CONFIG.COGNITO_REDIRECT_SIGN_OUT],
    responseType: 'code' as const,
  }

  // Configure Amplify Auth with the Cognito User Pool
  Amplify.configure({
    Auth: {
      Cognito: {
        ...options,
        loginWith: {
          oauth,
        },
      },
    },
  })

  // a loader has to return something or null
  return null
}

export default configureCognito
