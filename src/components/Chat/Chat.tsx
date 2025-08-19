import React, {
  useContext,
  useRef,
  useCallback,
  useReducer,
  useMemo,
} from 'react'
import { createChat, addMessageToChat } from '@/firebase/firestore'
import DOMPurify from 'dompurify'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
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

// Define state and actions for chat component state management
type ChatComponentState = {
  newMessage: string
  error: string | null
}

type ChatComponentAction =
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'CLEAR_MESSAGE' }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_ERROR' }

// Reducer to manage chat component state
const chatReducer = (
  state: ChatComponentState,
  action: ChatComponentAction
): ChatComponentState => {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { ...state, newMessage: action.message }
    case 'CLEAR_MESSAGE':
      return { ...state, newMessage: '' }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const { state, dispatch } = useContext(ChatContext)

  // Replace multiple useState calls with useReducer
  const [chatState, chatDispatch] = useReducer(chatReducer, {
    newMessage: '',
    error: null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>
  const currentUser = useFirebaseAuth()

  useUserChats(dispatch)
  useChatMessages(state.chatId, dispatch)
  useAutoScroll(state.messages, messagesEndRef)

  const isCurrentUser = useCallback(
    (userId: string) => (currentUser ? userId === currentUser.uid : false),
    [currentUser]
  )

  // Use useMemo for derived values
  const textInputIsEmpty = useMemo(
    () => !chatState.newMessage.trim(),
    [chatState.newMessage]
  )

  // Handle text input changes
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      chatDispatch({ type: 'SET_MESSAGE', message: e.target.value })
    },
    []
  )

  // Clear error handler
  const handleClearError = useCallback(() => {
    chatDispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmedMessage = chatState.newMessage.trim()
      if (trimmedMessage === '') return

      if (!currentUser) {
        chatDispatch({ type: 'SET_ERROR', error: 'User is not authenticated' })
        return
      }

      try {
        const sanitizedMessage = DOMPurify.sanitize(trimmedMessage)

        const messageData = {
          body: sanitizedMessage,
          from: currentUser.uid,
        }

        // Single batch of state updates for context state management
        if (!state.chatId) {
          const newChatId = await createChat()
          if (newChatId) {
            // Group dispatch operations to minimize renders
            dispatch({ type: 'SET_CHAT_ID', payload: newChatId })
            await addMessageToChat(newChatId, messageData)
          }
        } else {
          await addMessageToChat(state.chatId, messageData)
        }

        // Clear message in local state
        chatDispatch({ type: 'CLEAR_MESSAGE' })

        // Show/hide caption with animation
        dispatch({ type: 'SHOW_CAPTION', payload: true })
        setTimeout(
          () => dispatch({ type: 'SHOW_CAPTION', payload: false }),
          3000
        )
      } catch (error) {
        console.error('Error sending message:', error)
        chatDispatch({
          type: 'SET_ERROR',
          error: 'Failed to send message. Please try again.',
        })
      }
    },
    [chatState.newMessage, currentUser, state.chatId, dispatch]
  )

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
        {useMemo(
          () => (
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
          ),
          [state.messages, state.showCaption, isCurrentUser]
        )}
      </Box>
      {chatState.error && (
        <Alert severity="error" onClose={handleClearError}>
          {chatState.error}
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
          value={chatState.newMessage}
          onChange={handleMessageChange}
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
                  right: 12,
                  bottom: -2,
                }}
              >
                <IconButton
                  type="submit"
                  color="primary"
                  aria-label="send"
                  edge="end"
                  disabled={textInputIsEmpty}
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

export default React.memo(Chat)
