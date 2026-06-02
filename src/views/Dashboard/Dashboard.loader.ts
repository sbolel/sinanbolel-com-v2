/**
 * State loader for react-router data routes that require user's all teams.
 * @module views/Dashboard/Dashboard.loader
 * @see {@link dashboard/Routes}
 */
import { fetchUserAttributes } from 'aws-amplify/auth'

// @ts-ignore
const dashboardLoader = async () => {
  const attributes = await fetchUserAttributes()

  return {
    username: attributes.preferred_username ?? attributes.email,
  }
}

export default dashboardLoader
