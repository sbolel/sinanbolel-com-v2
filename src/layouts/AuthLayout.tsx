/**
 * Layout for authentication pages with white background.
 * @module layouts/AuthLayout
 */
import { Outlet } from 'react-router'
import Box from '@mui/material/Box'

const AuthLayout: React.FC = (): React.JSX.Element => (
  <Box
    sx={{ width: '100%', height: '100vh', backgroundColor: 'background.paper' }}
  >
    <Outlet />
  </Box>
)

export default AuthLayout
