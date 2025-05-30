/**
 * A component that renders a circular avatar for a user.
 * @module components/mui/Avatar
 */
import { forwardRef } from 'react'
import MuiAvatar, { AvatarProps } from '@mui/material/Avatar'
import { lighten, useTheme } from '@mui/material/styles'
import useBgColor, { UseBgColorType } from '@/hooks/useBgColor'
import { ThemeColor, ThemeSkin } from '@/types'

type InputProps = AvatarProps & {
  color?: ThemeColor
  skin?: ThemeSkin
}

const Avatar = forwardRef(
  (props: InputProps, ref: React.Ref<HTMLDivElement>) => {
    const theme = useTheme()
    const bgColors: UseBgColorType = useBgColor()

    const { color = 'primary', sx, src, skin = 'filled', ...rest } = props

    const getAvatarStyles = (
      skin: ThemeSkin | undefined,
      skinColor: ThemeColor
    ) => {
      if (skin === 'light') {
        return { ...bgColors[`${skinColor}Light`] }
      }
      if (skin === 'light-static') {
        return {
          color: bgColors[`${skinColor}Light`].color,
          backgroundColor: lighten(theme.palette[skinColor].main, 0.88),
        }
      }
      return { ...bgColors[`${skinColor}Filled`] }
    }

    const colors: UseBgColorType = {
      primary: getAvatarStyles(skin, 'primary'),
      secondary: getAvatarStyles(skin, 'secondary'),
      success: getAvatarStyles(skin, 'success'),
      error: getAvatarStyles(skin, 'error'),
      warning: getAvatarStyles(skin, 'warning'),
      info: getAvatarStyles(skin, 'info'),
    }

    return (
      <MuiAvatar
        ref={ref}
        data-testid="avatar"
        // skin and color are handled through sx prop
        src={src}
        {...rest}
        sx={!src && skin && color ? Object.assign(colors[color], sx) : sx}
      />
    )
  }
)

// Default props are now handled with default parameter values in the component

Avatar.displayName = 'Avatar'

export default Avatar
