import React, {
  useContext,
  useRef,
  useCallback,
  useReducer,
  useMemo,
  useEffect,
  useState,
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
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import { ChatContext } from '@/contexts/ChatContext'
import MessageBubble from '@/components/Chat/MessageBubble'
import useAutoScroll from '@/hooks/useAutoScroll'
import { logFirebaseError } from '@/firebase/errors'

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

const visuallyHiddenStyles = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
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
  const { state, dispatch, auth, history, messageStatus } =
    useContext(ChatContext)
  const currentUser = auth.user
  const [isSending, setIsSending] = useState(false)
  const submission = useRef<number | null>(null)
  const generation = useRef(0)
  const mounted = useRef(false)
  const captionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeUid = useRef(currentUser?.uid)
  activeUid.current = currentUser?.uid

  // Replace multiple useState calls with useReducer
  const [chatState, chatDispatch] = useReducer(chatReducer, {
    newMessage: '',
    error: null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>
  const textFieldRef = useRef<HTMLInputElement>(null)
  useAutoScroll(state.messages, messagesEndRef)

  const canSend =
    auth.status === 'ready' &&
    !!currentUser &&
    history.status === 'ready' &&
    (messageStatus.status === 'ready' || messageStatus.status === 'idle')

  useEffect(() => {
    ++generation.current
    submission.current = null
    setIsSending(false)
    chatDispatch({ type: 'CLEAR_ERROR' })
    if (captionTimer.current) clearTimeout(captionTimer.current)
  }, [currentUser?.uid])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      ++generation.current
      if (captionTimer.current) clearTimeout(captionTimer.current)
      dispatch({ type: 'SHOW_CAPTION', payload: false })
    }
  }, [dispatch])

  // Focus management - focus text field when chat opens
  useEffect(() => {
    const timer = setTimeout(() => textFieldRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

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
      if (submission.current !== null || !canSend || !currentUser) return
      const trimmedMessage = chatState.newMessage.trim()
      if (trimmedMessage === '') return
      const sanitizedMessage = DOMPurify.sanitize(trimmedMessage).trim()
      if (!sanitizedMessage) {
        chatDispatch({
          type: 'SET_ERROR',
          error: 'Please enter a message before sending.',
        })
        return
      }

      const request = ++generation.current
      const uid = currentUser.uid
      submission.current = request
      setIsSending(true)
      chatDispatch({ type: 'CLEAR_ERROR' })
      dispatch({ type: 'SHOW_CAPTION', payload: false })
      if (captionTimer.current) clearTimeout(captionTimer.current)
      const isActive = () =>
        mounted.current &&
        generation.current === request &&
        activeUid.current === uid
      try {
        const messageData = {
          body: sanitizedMessage,
          from: uid,
        }

        let chatId = state.chatId
        if (!chatId) {
          chatId = await createChat(uid)
          if (!chatId)
            throw Object.assign(
              new Error('Chat creation did not return an ID'),
              { code: 'chat/missing-id' }
            )
          dispatch({ type: 'SET_CHAT_ID', payload: chatId })
        }
        await addMessageToChat(chatId, messageData)
        if (!isActive()) return

        chatDispatch({ type: 'CLEAR_MESSAGE' })
        dispatch({ type: 'SHOW_CAPTION', payload: true })
        captionTimer.current = setTimeout(
          () => dispatch({ type: 'SHOW_CAPTION', payload: false }),
          3000
        )
      } catch (error) {
        if (!isActive()) return
        logFirebaseError('send-chat-message', error)
        chatDispatch({
          type: 'SET_ERROR',
          error: 'Failed to send message. Please try again.',
        })
      } finally {
        if (isActive()) {
          submission.current = null
          setIsSending(false)
        }
      }
    },
    [chatState.newMessage, currentUser, state.chatId, dispatch, canSend]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography id="chat-dialog-description" sx={visuallyHiddenStyles}>
        Send a message to Sinan using the chat input and send button.
      </Typography>
      <Box sx={headerStyles}>
        <Typography
          id="chat-dialog-title"
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
            aria-label="close chat dialog"
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
      {auth.status === 'initializing' && (
        <Typography role="status" sx={{ px: 2 }}>
          Connecting to chat...
        </Typography>
      )}
      {auth.status === 'ready' && history.status === 'loading' && (
        <Typography role="status" sx={{ px: 2 }}>
          Loading your conversation...
        </Typography>
      )}
      {messageStatus.status === 'loading' && (
        <Typography role="status" sx={{ px: 2 }}>
          Loading messages...
        </Typography>
      )}
      {auth.status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={auth.retry}>
              Retry
            </Button>
          }
        >
          Could not connect to chat. Please try again.
        </Alert>
      )}
      {history.status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={history.retry}>
              Retry
            </Button>
          }
        >
          Could not load your conversation. Please try again.
        </Alert>
      )}
      {messageStatus.status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={messageStatus.retry}>
              Retry
            </Button>
          }
        >
          Could not load messages. Please try again.
        </Alert>
      )}
      {chatState.error && (
        <Alert severity="error" onClose={handleClearError}>
          {chatState.error}
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        aria-busy={isSending}
        style={{ display: 'flex', padding: '16px' }}
      >
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={5}
          value={chatState.newMessage}
          disabled={isSending}
          onChange={handleMessageChange}
          placeholder="Type a message"
          variant="outlined"
          size="medium"
          inputRef={textFieldRef}
          slotProps={{
            htmlInput: {
              'aria-label': 'Message input',
            },
            input: {
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
                    aria-label="send message"
                    edge="end"
                    disabled={textInputIsEmpty || !canSend || isSending}
                    sx={{
                      transform: 'rotate(-90deg)',
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              ),
            },
          }}
        />
      </form>
    </Box>
  )
}

export default React.memo(Chat)
