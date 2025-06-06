/**
 * Layout for authentication pages with white background.
 * @module layouts/AuthLayout
 */
import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'

const AuthLayout: React.FC = (): React.JSX.Element => (
  <Box width="100%" height="100vh" sx={{ backgroundColor: 'background.paper' }}>
    <Outlet />
  </Box>
)

export default AuthLayout
