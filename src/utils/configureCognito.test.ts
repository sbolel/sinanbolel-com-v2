import { Amplify } from 'aws-amplify'
import configureCognito from '@/utils/configureCognito'

jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}))
jest.mock('@/utils/config', () => ({
  __esModule: true,
  default: {
    AWS_REGION: 'us-east-1',
    API_URL: 'https://localhost:3000/api',
    CF_DOMAIN: 'https://localhost:3000',
    COGNITO_DOMAIN: 'example.auth.us-east-1.amazoncognito.com',
    COGNITO_REDIRECT_SIGN_IN: 'https://localhost:3000/login',
    COGNITO_REDIRECT_SIGN_OUT: 'https://localhost:3000/logout',
    IDP_ENABLED: true,
    USER_POOL_CLIENT_ID: 'client-id',
    USER_POOL_ID: 'us-east-1_pool',
  },
}))

beforeEach(() => {
  jest.resetAllMocks()
})

afterAll(() => {
  jest.clearAllMocks()
})

test('calls Auth.configure', () => {
  configureCognito()
  expect(Amplify.configure).toHaveBeenCalled()
})

test('returns null', () => {
  const result = configureCognito()
  expect(result).toBeNull()
})
