import React, { useState, useEffect, useRef } from 'react'
import {
  doc,
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/firebase'
import {
  createChat,
  addMessageToChat,
  getUserChats,
} from '@/firebase/firestore'
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material'
import Avatar from '@/components/mui/Avatar'
import PersonIcon from '@mui/icons-material/Person'
import AdminIcon from '@mui/icons-material/SupervisorAccount'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import DOMPurify from 'dompurify'
import { Message } from '@/types/chat'

interface ChatProps {
  onClose?: () => void
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const [showCaption, setShowCaption] = useState(false)
  const captionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    const fetchUserChats = async () => {
      if (auth.currentUser) {
        const userChats = await getUserChats(auth.currentUser.uid)
        if (userChats.length > 0) {
          setChatId(userChats[0].id)
        }
      }
    }
    fetchUserChats()
  }, [])

  useEffect(() => {
    if (chatId) {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      )
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => doc.data() as Message)
        setMessages(messagesData)
      })

      return () => unsubscribe()
    }
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === '') return

    if (!auth.currentUser) {
      console.error('User is not authenticated')
      return
    }

    try {
      const sanitizedMessage = DOMPurify.sanitize(newMessage)

      const messageData = {
        body: sanitizedMessage,
        from: auth.currentUser.uid,
      }

      if (!chatId) {
        const newChatId = await createChat()
        if (newChatId) {
          setChatId(newChatId)
          await addMessageToChat(newChatId, messageData)
        }
      } else {
        await addMessageToChat(chatId, messageData)
      }

      setNewMessage('')
      setShowCaption(true)
      if (captionTimeoutRef.current) {
        clearTimeout(captionTimeoutRef.current)
      }
      captionTimeoutRef.current = setTimeout(() => setShowCaption(false), 3000)
    } catch (error) {
      console.error('Error sending message:', error)
      // Optionally show error to the user
    }
  }

  const isCurrentUser = (userId: string) => {
    if (!auth.currentUser) return false
    return userId === auth.currentUser.uid
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
          Chat with Sinan
        </Typography>
        {onClose && (
          <IconButton
            onClick={onClose}
            color="inherit"
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Paper
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List sx={{ overflow: 'auto' }}>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: isCurrentUser(msg.from)
                  ? 'flex-end'
                  : 'flex-start',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <ListItemAvatar
                sx={{
                  minWidth: 'auto',
                  m: '0 8px 0 0',
                }}
              >
                <Avatar>
                  {isCurrentUser(msg.from) ? <PersonIcon /> : <AdminIcon />}
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ maxWidth: '80%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    bgcolor: isCurrentUser(msg.from)
                      ? 'primary.light'
                      : 'grey.100',
                    borderRadius: 2,
                    display: 'inline-block',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', sm: '0.875rem' },
                    }}
                  >
                    {msg.body}
                  </Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    textAlign: isCurrentUser(msg.from) ? 'right' : 'left',
                    fontSize: { xs: '0.75rem', sm: '0.7rem' },
                  }}
                >
                  {msg.createdAt
                    ? msg.createdAt.toDate().toLocaleString()
                    : 'Sending...'}
                </Typography>
              </Box>
            </ListItem>
          ))}
          {showCaption && (
            <Paper
              elevation={3}
              sx={{
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
              }}
            >
              <Typography variant="body2">
                Your message has been sent
              </Typography>
            </Paper>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '16px' }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  color="primary"
                  aria-label="send"
                  edge="end"
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </form>
    </Box>
  )
}

export default Chat
