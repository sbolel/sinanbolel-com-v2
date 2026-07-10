/**
 * The main component that renders all routes in the application.
 * @module Root
 */
import { Outlet } from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import { ChatProvider } from '@/contexts/ChatContext'
import { AlertProvider } from '@/hooks/useAlert'
import DialogProvider from '@/hooks/useDialog'
import AuthProvider from '@/store/auth/AuthProvider'
import theme from '@/theme/theme'

const Root: React.FC = () => (
  <ThemeProvider theme={theme}>
    <AuthProvider>
      <ChatProvider>
        <AlertProvider>
          <DialogProvider>
            <Outlet />
          </DialogProvider>
        </AlertProvider>
      </ChatProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default Root
