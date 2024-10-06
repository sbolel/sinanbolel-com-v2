import React, { useState, useEffect, useRef } from 'react'
import {
  doc,
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
  Timestamp
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
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Typography,
} from '@mui/material'
import Avatar from '@/components/mui/Avatar'
import PersonIcon from '@mui/icons-material/Person'
import AdminIcon from '@mui/icons-material/SupervisorAccount'
import DOMPurify from 'dompurify'
import { Message } from '@/types/chat'

const Chat: React.FC = () => {
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
      );
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => doc.data() as Message);
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === '') return

    if (!auth.currentUser) {
      console.error('User is not authenticated');
      return;
    }

    try {
      const sanitizedMessage = DOMPurify.sanitize(newMessage);

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
      console.error('Error sending message:', error);
      // Optionally show error to the user
    }
  }

  const isCurrentUser = (userId: string) => {
    if (!auth.currentUser) return false;
    return userId === auth.currentUser.uid;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <Typography
        variant="h6"
        component="div"
        sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}
      >
        Chat
      </Typography>
      <Paper sx={{ flex: 1, overflow: 'auto', mb: 2, p: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: isCurrentUser(msg.from) ? 'flex-end' : 'flex-start',
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
              <Box sx={{ maxWidth: '70%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    bgcolor: isCurrentUser(msg.from)
                      ? 'primary.light'
                      : 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{msg.body}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    textAlign: isCurrentUser(msg.from) ? 'right' : 'left',
                  }}
                >
                  {msg.createdAt.toDate().toLocaleString()}
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
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', m: 2 }}
      >
        <TextField
          fullWidth
          multiline
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ alignSelf: 'flex-end' }}
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}

export default Chat
