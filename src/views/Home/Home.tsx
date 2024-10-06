import React, { useState } from 'react'
import { Box, Container, Dialog, Fab, Typography } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import Chat from '@/components/Chat/Chat'
import Image from '@/components/Image'
import styles from '@/views/Home/Home.module.scss'

const Home: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false)

  const toggleChat = () => {
    setChatOpen(!chatOpen)
  }

  return (
    <Container
      className={styles.container}
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Image
        src=""
        srcSet="sinan-bolel.png 3x"
        alt="Sinan Bolel"
        sx={{ height: '240' }}
      />
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
        <Box
          className={styles.connections}
          style={{ display: 'flex', gap: '1rem' }}
        >
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
      <Fab
        id="chat-button"
        aria-label="chat-button"
        color="info"
        onClick={toggleChat}
        size="large"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <ChatIcon />
      </Fab>
      <Dialog
        open={chatOpen}
        onClose={toggleChat}
        aria-labelledby="chat-dialog"
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 80,
            right: 16,
            m: 0,
            width: {
              xs: 'calc(100% - 32px)',
              sm: 350,
              md: 400,
              lg: 450,
            },
            maxHeight: 'calc(100% - 96px)',
          },
        }}
      >
        <Chat onClose={toggleChat} />
      </Dialog>
    </Container>
  )
}

export default Home
