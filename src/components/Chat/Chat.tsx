import React, { useState, useEffect, useRef } from 'react'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
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

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === '') return

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      createdAt: new Date(),
      uid: auth.currentUser?.uid,
    })

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
          {messages.map((msg) => (
            <ListItem key={msg.id}>
              <ListItemText
                primary={msg.text}
                secondary={new Date(msg.createdAt.toDate()).toLocaleString()}
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
