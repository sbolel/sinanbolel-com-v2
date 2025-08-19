/**
 * Demo page for testing accessibility improvements
 */
import React, { useState } from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import Image from './Image'
import MessageBubble from '../components/Chat/MessageBubble'
import MultiDropzone from './MultiDropzone/MultiDropzone'
import CreateForm from '../components/crud/CreateForm'
import { FormField } from '../types'

const AccessibilityDemo: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const mockMessage = {
    body: 'This is a test message that you can interact with using keyboard navigation. Try pressing Tab to focus it, then Enter or Space to activate.',
    from: 'user1',
    createdAt: { toDate: () => new Date() } as any,
  }

  const formSchema: FormField[] = [
    {
      name: 'testField',
      label: 'Test Field',
      required: true,
      component: ({ inputRef, ...props }) => (
        <input
          ref={inputRef}
          {...props}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      ),
    },
  ]

  const handleImageClick = () => {
    alert('Image clicked! This demonstrates keyboard accessibility.')
  }

  const handleMessageClick = () => {
    alert('Message clicked! This demonstrates keyboard accessibility.')
  }

  const handleFileSelect = (files: File[]) => {
    console.log('Files selected:', files)
  }

  const handleRemoveFile = (id: string) => {
    console.log('File removed:', id)
  }

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data)
    setShowCreateForm(false)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        Accessibility Demo
      </Typography>

      <Typography variant="body1" paragraph>
        This page demonstrates the accessibility improvements made to various
        components. Use Tab to navigate through interactive elements and
        Enter/Space to activate them.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Interactive Image
        </Typography>
        <Typography variant="body2" paragraph>
          This image is keyboard accessible when it has an onClick handler:
        </Typography>
        <Image
          src="https://picsum.photos/200/150"
          alt="Demo image that is keyboard accessible"
          onClick={handleImageClick}
          sx={{ mb: 2 }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Interactive Message Bubble
        </Typography>
        <Typography variant="body2" paragraph>
          This message bubble is keyboard accessible:
        </Typography>
        <MessageBubble
          message={mockMessage}
          isCurrentUser={true}
          onClick={handleMessageClick}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          File Upload Dropzone
        </Typography>
        <Typography variant="body2" paragraph>
          This dropzone is keyboard accessible - focus it and press Enter/Space
          to browse files:
        </Typography>
        <MultiDropzone
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
          maxFiles={3}
          maxSize={5 * 1024 * 1024} // 5MB
          multiple={true}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          uploadedFiles={uploadedFiles}
          uploading={false}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Modal Dialog
        </Typography>
        <Typography variant="body2" paragraph>
          This button opens a modal with proper focus management:
        </Typography>
        <Button variant="contained" onClick={() => setShowCreateForm(true)}>
          Open Modal Form
        </Button>

        <CreateForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleFormSubmit}
          schema={formSchema}
          title="Accessible Form Dialog"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h3" gutterBottom>
          Testing Instructions
        </Typography>
        <Typography component="div">
          <ol>
            <li>Use Tab key to navigate through all interactive elements</li>
            <li>
              Use Enter or Space to activate buttons and interactive elements
            </li>
            <li>Open the modal dialog and notice focus management</li>
            <li>Test the file dropzone with keyboard navigation</li>
            <li>
              Verify that focus returns to the triggering element when closing
              dialogs
            </li>
            <li>Use screen reader to verify ARIA labels and descriptions</li>
          </ol>
        </Typography>
      </Box>
    </Container>
  )
}

export default AccessibilityDemo
