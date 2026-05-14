/**
 * State loader for react-router data routes that require user's all teams.
 * @module views/Dashboard/Dashboard.loader
 * @see {@link dashboard/Routes}
 */
import { getCurrentUser } from 'aws-amplify/auth'

// @ts-ignore
const dashboardLoader = async () => {
  const userInfo = await getCurrentUser()
  return {
    username: userInfo.username,
  }
}

export default dashboardLoader
