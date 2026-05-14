import { fetchUserAttributes } from 'aws-amplify/auth'
import dashboardLoader from './Dashboard.loader'

jest.mock('aws-amplify/auth', () => ({
  fetchUserAttributes: jest.fn(),
}))

test('returns preferred username from current user attributes', async () => {
  ;(fetchUserAttributes as jest.Mock).mockResolvedValue({
    email: 'test@example.com',
    preferred_username: 'test-user',
  })
  const data = await dashboardLoader()
  expect(fetchUserAttributes).toHaveBeenCalled()
  expect(data).toEqual({ username: 'test-user' })
})

test('falls back to email when preferred username is unavailable', async () => {
  ;(fetchUserAttributes as jest.Mock).mockResolvedValue({
    email: 'test@example.com',
  })
  const data = await dashboardLoader()
  expect(data).toEqual({ username: 'test@example.com' })
})
