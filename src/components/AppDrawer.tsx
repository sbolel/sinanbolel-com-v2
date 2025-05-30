/**
 * @module components/AppDrawer
 */
import { styled } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'
import { MuiDrawerWidth } from '@/theme/theme'

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiPaper-root': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[900],
  },
  '& .MuiDrawer-root': {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    width: MuiDrawerWidth,
  },
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: MuiDrawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
  '& .MuiLink-root': {
    textDecoration: 'none',
  },
  '& .MuiListItemButton-root': {},
  '& .MuiListItemIcon-root': {
    minWidth: 'auto',
    marginLeft: '9px',
  },
  '& .MuiListItemText-root': {
    marginLeft: '-9px',
  },
}))

const AppDrawer = (props: React.ComponentProps<typeof StyledDrawer>) => (
  <StyledDrawer
    component="nav"
    role="navigation"
    variant="permanent"
    {...props}
  />
)

export default AppDrawer
