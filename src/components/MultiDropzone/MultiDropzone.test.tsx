import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import MultiDropzone from '@/components/MultiDropzone/MultiDropzone'

const onFileSelect = jest.fn()
const onRemoveFile = jest.fn()

test('renders without crashing', () => {
  const { container } = render(
    <MultiDropzone
      onFileSelect={() => ({})}
      onRemoveFile={() => ({})}
      uploadedFiles={[]}
      uploading={false}
    />
  )

  expect(container.firstChild).toBeInTheDocument()
})

test('calls onFileSelect when a file is dropped', () => {
  const handleFileSelect = jest.fn()

  const file = new File(['hello'], 'hello.png', { type: 'image/png' })
  const dataTransfer = {
    files: [file],
    items: [
      {
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      },
    ],
    types: ['Files'],
  }

  render(
    <MultiDropzone
      onFileSelect={handleFileSelect}
      onRemoveFile={() => ({})}
      uploadedFiles={[]}
      uploading={false}
    />
  )

  act(() => {
    fireEvent.drop(
      screen.getByLabelText('Drag and Drop File Selection'),
      dataTransfer
    )

    waitFor(() => {
      expect(handleFileSelect).toHaveBeenCalledWith([file])
    })
  })
})

test('calls onRemoveFile when a file is removed', () => {
  const handleRemoveFile = jest.fn()
  render(
    <MultiDropzone
      onFileSelect={() => ({})}
      onRemoveFile={handleRemoveFile}
      uploadedFiles={[{ id: '1', name: 'hello.png', progress: 0 }]}
      uploading={false}
    />
  )

  fireEvent.click(screen.getByRole('button', { name: /file-action/i }))

  expect(handleRemoveFile).toHaveBeenCalledWith('1')
})

test('displays uploaded files', () => {
  render(
    <MultiDropzone
      onFileSelect={onFileSelect}
      onRemoveFile={onRemoveFile}
      uploadedFiles={[{ id: '1', name: 'hello.png', progress: 0 }]}
      uploading={false}
    />
  )

  const uploadedFile = screen.getByText('hello.png')

  expect(uploadedFile).toBeInTheDocument()
})

test('displays an error message when a file exceeds the maxSize', () => {
  render(
    <MultiDropzone
      onFileSelect={() => ({})}
      onRemoveFile={() => ({})}
      uploadedFiles={[
        {
          id: '1',
          name: 'hello.png',
          progress: 0,
          error: 'File is too large.',
        },
      ]}
      maxSize={10}
      maxFiles={1}
      uploading={false}
    />
  )

  // Create a mock file larger than maxSize
  const file = new File([new Array(1024).join('a')], 'hello.png', {
    type: 'image/png',
  })

  // Create a mock DataTransfer object with file larger than maxSize
  const dataTransfer = {
    files: [file],
    items: [
      {
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      },
    ],
    types: ['json'],
  }

  act(() => {
    fireEvent.drop(
      screen.getByLabelText('Drag and Drop File Selection'),
      dataTransfer
    )

    waitFor(() => {
      expect(screen.getByText(/File is too large./i)).toBeInTheDocument()
    })
  })
})
