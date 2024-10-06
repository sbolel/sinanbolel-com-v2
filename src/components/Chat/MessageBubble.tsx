import React from 'react'
import { Box, Paper, Typography, Avatar } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import AdminIcon from '@mui/icons-material/SupervisorAccount'
import { Message } from '@/types/chat'

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message, isCurrentUser }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        {!isCurrentUser && (
          <Avatar sx={{ mr: 1 }}>
            <AdminIcon />
          </Avatar>
        )}
        <Box
          sx={{
            maxWidth: '80%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
              borderRadius: 2,
              minWidth: '60px',
              maxWidth: '100%', // Limit the bubble width to 100% of its container
              justifyContent: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              m: 0,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: isCurrentUser ? 'common.white' : 'text.primary',
                py: 1,
                px: 2.33,
                width: 'fit-content',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                letterSpacing: '0.5px',
                fontSize: {
                  xs: '1rem',
                  sm: '0.875rem',
                  md: '1rem',
                  lg: '1.125rem',
                  xl: '1.25rem',
                },
              }}
            >
              {message.body}
            </Typography>
          </Paper>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              textAlign: isCurrentUser ? 'right' : 'left',
              display: 'block',
              color: 'text.secondary',
            }}
          >
            {message.createdAt
              ? message.createdAt.toDate().toLocaleString(undefined, {
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })
              : 'Sending...'}
          </Typography>
        </Box>
        {isCurrentUser && (
          <Avatar sx={{ ml: 1 }}>
            <PersonIcon />
          </Avatar>
        )}
      </Box>
    )
  }
)

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble
