/**
 * An image component that defaults to lazy loading.
 * @module components/Image
 */
import Box from '@mui/material/Box'

type ImageProps = {
  src: HTMLImageElement['src']
  srcSet?: HTMLImageElement['srcset']
  alt?: HTMLImageElement['alt']
  loading?: HTMLImageElement['loading']
  sx?: React.CSSProperties
  onClick?: () => void
  tabIndex?: number
  role?: string
}

/**
 * An image component that defaults to lazy loading.
 * @param {ImageProps} props Input props for the Image component.
 * @param {string} [props.alt] Image alt text.
 * @param {string} [props.loading='lazy'] Optional image loading attribute.
 * @param {string} props.src The image source.
 * @param {string} [props.srcSet] The image source set.
 * @param {React.CSSProperties} [props.sx] The image style.
 * @param {number} props.sx.height The image height in pixels.
 * @param {number} props.sx.width The image width in pixels.
 * @param {() => void} [props.onClick] Optional click handler.
 * @param {number} [props.tabIndex] Optional tab index for keyboard navigation.
 * @param {string} [props.role] Optional ARIA role.
 * @returns {React.JSX.Element} The Image component.
 */
const Image: React.FC<ImageProps> = ({
  alt = '',
  loading = 'lazy',
  src,
  srcSet,
  sx = {},
  sx: { height, width } = {},
  onClick,
  tabIndex,
  role,
}): React.JSX.Element => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  const isInteractive = !!onClick
  const imageProps = {
    alt,
    loading,
    src,
    srcSet: srcSet || `${src} 2x`,
    height,
    width,
    ...(isInteractive && {
      tabIndex: tabIndex ?? 0,
      role: role || 'button',
      onKeyDown: handleKeyDown,
      onClick,
      style: { cursor: 'pointer' },
    }),
  }

  return (
    <Box sx={sx}>
      <img {...imageProps} />
    </Box>
  )
}

export default Image
