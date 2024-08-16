import React from 'react'
import { Container, Typography, Box } from '@mui/material'
import Image from '@/components/Image'
import '@/styles/base.css'
import '@/styles/buttons.css'
import '@/styles/icons.css'
import '@/styles/tooltip.css'

const Home: React.FC = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <Image srcSet="sinan-bolel.jpg 3x" alt="Sinan Bolel" />
      <Typography
        variant="h1"
        component="h1"
        color="white"
        sx={{
          fontSize: '3rem',
          fontWeight: 300,
          marginBottom: '.5rem',
          textShadow: 'rgb(75, 75, 75) 1px 0',
        }}
      >
        Sinan Bolel
      </Typography>
      <Typography
        variant="h2"
        component="h2"
        color="white"
        sx={{
          fontSize: '1.5rem',
          fontWeight: 200,
        }}
      >
        Principal Software Engineer
      </Typography>
      <Box sx={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Box className="connections" style={{ display: 'flex', gap: '1rem' }}>
          <a
            id="a-resume"
            className="md-button md-fab md-raised md-button-shrink"
            data-md-tooltip="Resume"
            href="https://sinanbolel.com/resume"
            target="_blank"
            aria-label="Resume"
            rel="noreferrer"
          >
            <div className="md-font ion-logo ion-logo-resume"></div>
          </a>
          <a
            id="a-linkedin"
            className="md-button md-fab md-raised md-button-shrink"
            data-md-tooltip="LinkedIn"
            href="https://sinanbolel.com/linkedin"
            target="_blank"
            aria-label="LinkedIn"
            rel="noreferrer"
          >
            <div className="md-font ion-logo ion-logo-linkedin"></div>
          </a>
          <a
            id="a-github"
            className="md-button md-fab md-raised md-button-shrink"
            data-md-tooltip="GitHub"
            href="https://sinanbolel.com/github"
            target="_blank"
            aria-label="GitHub"
            rel="noreferrer"
          >
            <div className="md-font ion-logo ion-logo-github"></div>
          </a>
          <a
            id="a-stackoverflow"
            className="md-button md-fab md-raised md-button-shrink"
            data-md-tooltip="StackOverflow"
            href="https://sinanbolel.com/stackoverflow"
            target="_blank"
            aria-label="StackOverflow"
            rel="noreferrer"
          >
            <div className="md-font ion-logo ion-logo-stackoverflow"></div>
          </a>
        </Box>
      </Box>
    </Container>
  )
}

export default Home
