import React, { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { createChat, addMessageToChat } from '@/firebase/firestore'
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'

interface Message {
  body: string
  createdAt: string
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

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

    if (!chatId) {
      const newChatId = await createChat(newMessage)
      if (newChatId) setChatId(newChatId)
    } else {
      await addMessageToChat(chatId, newMessage)
    }

    setNewMessage('')
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
      <Paper sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={msg.body}
                secondary={new Date(msg.createdAt).toLocaleString()}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          variant="outlined"
          size="small"
        />
        <Button type="submit" variant="contained" sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  )
}

export default Chat
