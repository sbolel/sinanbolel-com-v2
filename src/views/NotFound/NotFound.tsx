/**
 * Simple 404 page displayed for unknown routes.
 * @module views/NotFound/NotFound
 */
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

const NotFound: React.FC = (): React.JSX.Element => (
  <Container sx={{ textAlign: 'center', pt: 4 }}>
    <Typography variant="h3" gutterBottom>
      404 - Page Not Found
    </Typography>
    <Typography variant="body1">
      The page you are looking for does not exist.
    </Typography>
  </Container>
)

export default NotFound
