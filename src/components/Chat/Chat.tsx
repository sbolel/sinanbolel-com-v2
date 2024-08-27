import React, { useState, useEffect, useRef } from 'react'
import {
  doc,
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
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

interface Message {
  body: string
  createdAt: string
  from: string
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const [showCaption, setShowCaption] = useState(false)
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
      const unsubscribe = onSnapshot(doc(db, 'chats', chatId), (doc) => {
        if (doc.exists()) {
          setMessages(doc.data().messages)
        }
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

    const messageData = {
      body: newMessage,
      from: auth.currentUser?.uid || 'anonymous',
    }

    if (!chatId) {
      const newChatId = await createChat(messageData)
      if (newChatId) setChatId(newChatId)
    } else {
      await addMessageToChat(chatId, messageData)
    }

    setNewMessage('')
    setShowCaption(true)
    setTimeout(() => setShowCaption(false), 5000)
  }

  const isCurrentUser = (userId: string) => userId === auth.currentUser?.uid

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <Typography
        variant="h6"
        component="div"
        sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}
      >
        Chat
      </Typography>
      <Paper sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{
                flexDirection: isCurrentUser(msg.from) ? 'row-reverse' : 'row',
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      bgcolor: isCurrentUser(msg.from) ? 'grey.200' : 'white',
                      borderRadius: 2,
                    }}
                  >
                    {msg.body}
                  </Paper>
                }
                secondary={new Date(msg.createdAt).toLocaleString()}
                secondaryTypographyProps={{
                  align: isCurrentUser(msg.from) ? 'right' : 'left',
                }}
              />
            </ListItem>
          ))}
          {showCaption && (
            <Typography
              variant="caption"
              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
            >
              Your message has been sent to Sinan.
            </Typography>
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
