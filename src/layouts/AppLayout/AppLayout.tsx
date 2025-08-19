/**
 * The layout for rendering the authenticated user's layout.
 * @module layouts/AppLayout/AppLayout
 */
import { useCallback, useState, Suspense, useRef, useEffect } from 'react'
import { Await, Navigate, Outlet, useLoaderData } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import AlertMessage from '@/components/AlertMessage'
import AppBar from '@/components/AppBar'
import AppDrawer from '@/components/AppDrawer'
import AuthButton from '@/components/HeaderAuthButton'
import MenuListItems from '@/layouts/AppLayout/AppDrawerButtonList'
import Chat from '@/components/Chat/Chat'
import { DASHBOARD_TITLE } from '@/locales/en'
import { Routes } from '@/router/constants'

/**
 * The main layout that renders the application layout for authenticated users.
 * If the user is not authenticated, they will be redirected to the login page.
 * @returns {React.JSX.Element} The main application layout component.
 */
const AppLayout: React.FC = (): React.JSX.Element => {
  const jwtToken = useLoaderData() as string
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  const [chatClicked, setChatClicked] = useState(false)

  const chatButtonRef = useRef<HTMLButtonElement>(null)
  const mainContentRef = useRef<HTMLElement>(null)

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(!drawerOpen)
    // Focus management - return focus to toggle button or main content
    setTimeout(() => {
      if (drawerOpen) {
        // When closing drawer, focus the menu button that opens it
        const openButton = document.querySelector(
          '[data-testid="open-drawer-button"]'
        ) as HTMLButtonElement
        if (openButton) {
          openButton.focus()
        }
      } else {
        // When opening drawer, focus the close button
        const closeButton = document.querySelector(
          '[data-testid="close-drawer-button"]'
        ) as HTMLButtonElement
        if (closeButton) {
          closeButton.focus()
        }
      }
    }, 100)
  }, [drawerOpen])

  const toggleChat = useCallback(() => {
    setChatClicked(true)
    setChatOpen(!chatOpen)
  }, [chatOpen])

  // Focus management when chat closes
  useEffect(() => {
    if (!chatOpen && chatClicked && chatButtonRef.current) {
      setTimeout(() => {
        chatButtonRef.current?.focus()
      }, 100)
    }
  }, [chatOpen, chatClicked])

  return (
    <>
      <CssBaseline />
      <Suspense
        fallback={
          <Navigate
            to={Routes.AUTH_LOGIN}
            state={{ from: window.location.pathname }}
            replace
          />
        }
      >
        <Await resolve={jwtToken}>
          <Box
            data-testid="app"
            sx={{
              display: 'flex',
              flexGrow: 1,
              height: '100vh',
              overflow: 'scroll',
            }}
          >
            <AlertMessage />

            {/* top nav bar */}
            <AppBar position="absolute" open={drawerOpen} color="secondary">
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleDrawer}
                  sx={{
                    marginRight: '36px',
                    ...(drawerOpen && { display: 'none' }),
                  }}
                  aria-label="open drawer"
                  data-testid="open-drawer-button"
                  name="open drawer"
                  aria-hidden={drawerOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  color="inherit"
                  component="span"
                  noWrap
                  sx={{ flexGrow: 1 }}
                  variant="h6"
                  data-testid="appbar-title"
                >
                  {DASHBOARD_TITLE}
                </Typography>
                <AuthButton />
              </Toolbar>
            </AppBar>

            {/* menu drawer */}
            <AppDrawer
              open={drawerOpen}
              data-open={drawerOpen}
              data-testid="app-drawer"
            >
              <Toolbar
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  filter: `brightness(80%)`,
                }}
              >
                <IconButton
                  onClick={toggleDrawer}
                  aria-label="close drawer"
                  data-testid="close-drawer-button"
                  name="close drawer"
                  aria-hidden={!drawerOpen}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Toolbar>
              <Divider />

              <List component="nav">
                <MenuListItems />
              </List>
            </AppDrawer>
            <Container
              component="main"
              ref={mainContentRef}
              sx={{
                mt: (theme) => `${theme.mixins.toolbar.minHeight}px`,
                pt: (theme) => theme.spacing(4),
              }}
            >
              {/* Skip to main content link */}
              <Box
                component="a"
                href="#main-content"
                sx={{
                  position: 'absolute',
                  left: '-9999px',
                  top: 'auto',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  '&:focus': {
                    position: 'static',
                    width: 'auto',
                    height: 'auto',
                    overflow: 'visible',
                    left: 0,
                    top: 0,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    padding: 1,
                    textDecoration: 'none',
                    zIndex: 9999,
                  },
                }}
              >
                Skip to main content
              </Box>
              <Box id="main-content" tabIndex={-1}>
                <Outlet />
              </Box>
            </Container>
            <Tooltip
              title="Let's chat"
              open={!chatClicked}
              disableHoverListener={chatClicked}
              placement="left"
            >
              <Fab
                ref={chatButtonRef}
                color="primary"
                aria-label={chatOpen ? 'close chat' : 'open chat'}
                aria-expanded={chatOpen}
                aria-controls="chat-dialog"
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  right: 16,
                }}
                onClick={toggleChat}
              >
                {chatOpen ? <CloseIcon /> : <ChatIcon />}
              </Fab>
            </Tooltip>
            <Dialog
              open={chatOpen}
              onClose={toggleChat}
              aria-labelledby="chat-dialog-title"
              aria-describedby="chat-dialog-description"
              maxWidth="sm"
              fullWidth
              id="chat-dialog"
            >
              <DialogContent>
                <Suspense fallback={<CircularProgress />}>
                  <Chat />
                </Suspense>
              </DialogContent>
            </Dialog>
          </Box>
        </Await>
      </Suspense>
    </>
  )
}

export default AppLayout
