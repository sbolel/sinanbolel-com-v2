import { render, cleanup } from '@testing-library/react'
import { ThemeProvider, lighten } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import Avatar from '@/components/mui/Avatar'
import hexToRGBA from '@/utils/hexToRGBA'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
})

describe('MUI Avatar Component', () => {
  afterEach(cleanup)

  test('renders without crashing', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Avatar data-testid="avatar" />
      </ThemeProvider>
    )
    expect(getByTestId('avatar')).toBeInTheDocument()
  })

  describe('skin and color props', () => {
    test('correctly applies them for the light-static skin', () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <Avatar data-testid="avatar" color="secondary" skin="light-static" />
        </ThemeProvider>
      )
      const avatarElement = getByTestId('avatar')
      // skin and color props are now only used for styling, not as attributes
      expect(avatarElement).toHaveStyle(
        `background-color: ${lighten(theme.palette.secondary.main, 0.88)}`
      )
    })

    test('correctly applies them for the light skin', () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <Avatar data-testid="avatar" color="secondary" skin="light" />
        </ThemeProvider>
      )
      const avatarElement = getByTestId('avatar')
      // skin and color props are now only used for styling, not as attributes
      expect(avatarElement).toHaveStyle(
        `background-color: ${hexToRGBA(theme.palette.secondary.main, 0.12)}`
      )
    })
  })

  test('sets the default skin and color props', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Avatar data-testid="avatar" />
      </ThemeProvider>
    )
    const avatarElement = getByTestId('avatar')
    // skin and color props are now only used for styling, not as attributes
    expect(avatarElement).toHaveStyle(`
      background-color: ${theme.palette.primary.main};
      color: #fff;
    `)
  })

  test('applies additional styles via the sx prop', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Avatar
          data-testid="avatar"
          color="primary"
          skin="filled"
          sx={{
            width: 40,
            height: 40,
          }}
        />
      </ThemeProvider>
    )
    const avatarElement = getByTestId('avatar')
    expect(avatarElement).not.toHaveAttribute('src')
    expect(avatarElement).toHaveStyle(`
      height: 40px;
      width: 40px;
    `)
  })
})
