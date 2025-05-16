/**
 * @module components/AppDrawer
 */
import { styled } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'
import { MuiDrawerWidth } from '@/theme/theme'

// Add default role and variant props to the styled component
const AppDrawer = styled(MuiDrawer, {
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

// Create a wrapper component that includes the default props
import { DrawerProps } from '@mui/material/Drawer'

const StyledAppDrawer = (props: Omit<DrawerProps, 'role' | 'variant'>) => (
  <AppDrawer role="navigation" variant="permanent" {...props} />
)

export default StyledAppDrawer
