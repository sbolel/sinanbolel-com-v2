import { getCurrentUser } from 'aws-amplify/auth'
import dashboardLoader from './Dashboard.loader'

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
}))

test('returns username from current user info', async () => {
  ;(getCurrentUser as jest.Mock).mockResolvedValue({
    username: 'test-user',
  })
  const data = await dashboardLoader()
  expect(getCurrentUser).toHaveBeenCalled()
  expect(data).toEqual({ username: 'test-user' })
})
