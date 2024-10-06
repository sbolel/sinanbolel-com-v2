import React, { useState, useContext, useRef, useCallback } from 'react'
import { createChat, addMessageToChat } from '@/firebase/firestore'
import DOMPurify from 'dompurify'
import {
  Box,
  TextField,
  List,
  Paper,
  Typography,
  IconButton,
  Alert,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import { ChatContext } from '@/contexts/ChatContext'
import MessageBubble from '@/components/Chat/MessageBubble'
import useFirebaseAuth from '@/hooks/useFirebaseAuth'
import useUserChats from '@/hooks/useUserChats'
import useChatMessages from '@/hooks/useChatMessages'
import useAutoScroll from '@/hooks/useAutoScroll'

interface ChatProps {
  onClose?: () => void
}

const headerStyles = {
  display: 'flex',
  alignItems: 'center',
  p: 2,
  bgcolor: 'primary.main',
  color: 'white',
  position: 'relative',
}

const messageListStyles = {
  flexGrow: 1,
  overflow: 'auto',
  mb: 0.5,
  p: 1,
}

const captionStyles = {
  position: 'sticky',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'fit-content',
  padding: '8px 16px',
  backgroundColor: 'success.light',
  color: 'success.contrastText',
  borderRadius: 2,
  zIndex: 1,
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const { state, dispatch } = useContext(ChatContext)
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = useFirebaseAuth()

  useUserChats(dispatch)
  useChatMessages(state.chatId, dispatch)
  useAutoScroll(state.messages, messagesEndRef)

  const isCurrentUser = useCallback(
    (userId: string) => (currentUser ? userId === currentUser.uid : false),
    [currentUser]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = newMessage.trim()
    if (trimmedMessage === '') return

    if (!currentUser) {
      setError('User is not authenticated')
      return
    }

    try {
      const sanitizedMessage = DOMPurify.sanitize(trimmedMessage)

      const messageData = {
        body: sanitizedMessage,
        from: currentUser.uid,
      }

      if (!state.chatId) {
        const newChatId = await createChat()
        if (newChatId) {
          dispatch({ type: 'SET_CHAT_ID', payload: newChatId })
          await addMessageToChat(newChatId, messageData)
        }
      } else {
        await addMessageToChat(state.chatId, messageData)
      }

      setNewMessage('')
      dispatch({ type: 'SHOW_CAPTION', payload: true })
      setTimeout(() => dispatch({ type: 'SHOW_CAPTION', payload: false }), 3000)
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={headerStyles}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: 'white',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          Chat with Sinan
        </Typography>
        {onClose && (
          <IconButton
            onClick={onClose}
            color="inherit"
            aria-label="close"
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Box sx={messageListStyles}>
        <List sx={{ overflow: 'auto' }}>
          {state.messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              isCurrentUser={isCurrentUser(msg.from)}
            />
          ))}
          {state.showCaption && (
            <Paper elevation={3} sx={captionStyles}>
              <Typography variant="body2">
                Your message has been sent
              </Typography>
            </Paper>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', padding: '16px' }}
      >
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={5}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          variant="outlined"
          size="medium"
          InputProps={{
            sx: {
              padding: '8px',
              paddingRight: '48px',
            },
            endAdornment: (
              <Box
                sx={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                }}
              >
                <IconButton
                  type="submit"
                  color="primary"
                  aria-label="send"
                  edge="end"
                  sx={{
                    transform: 'rotate(-90deg)',
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            ),
          }}
        />
      </form>
    </Box>
  )
}

export default Chat
