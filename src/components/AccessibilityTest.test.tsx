/**
 * Tests for accessibility enhancements
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Image from './Image'
import MessageBubble from './Chat/MessageBubble'
import AlertMessage from './AlertMessage'

// Mock Firebase timestamp
const mockTimestamp = {
  toDate: () => new Date('2024-01-01T12:00:00Z'),
}

describe('Accessibility Enhancements', () => {
  describe('Image Component', () => {
    it('should be focusable and handle keyboard events when interactive', () => {
      const mockOnClick = jest.fn()
      render(<Image src="test.jpg" alt="Test image" onClick={mockOnClick} />)

      const image = screen.getByRole('button')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('tabIndex', '0')

      // Test keyboard navigation
      fireEvent.keyDown(image, { key: 'Enter' })
      expect(mockOnClick).toHaveBeenCalledTimes(1)

      fireEvent.keyDown(image, { key: ' ' })
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })

    it('should not be focusable when not interactive', () => {
      render(<Image src="test.jpg" alt="Test image" />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
      expect(image).not.toHaveAttribute('tabIndex')
    })
  })

  describe('MessageBubble Component', () => {
    const mockMessage = {
      body: 'Test message',
      from: 'user1',
      createdAt: mockTimestamp,
    }

    it('should be focusable and handle keyboard events when interactive', () => {
      const mockOnClick = jest.fn()
      render(
        <MessageBubble
          message={mockMessage}
          isCurrentUser={true}
          onClick={mockOnClick}
        />
      )

      const bubble = screen.getByRole('button')
      expect(bubble).toBeInTheDocument()
      expect(bubble).toHaveAttribute('tabIndex', '0')

      // Test keyboard navigation
      fireEvent.keyDown(bubble, { key: 'Enter' })
      expect(mockOnClick).toHaveBeenCalledTimes(1)

      fireEvent.keyDown(bubble, { key: ' ' })
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })

    it('should not be focusable when not interactive', () => {
      render(<MessageBubble message={mockMessage} isCurrentUser={true} />)

      // Should not have button role when not interactive
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('AlertMessage Component', () => {
    // Mock the useAlert hook
    const mockClearAlert = jest.fn()
    const mockUseAlert = {
      clearAlert: mockClearAlert,
      state: {
        isVisible: true,
        severity: 'info' as const,
        message: 'Test alert',
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()
      // Mock the useAlert hook
      jest.doMock('@/hooks/useAlert', () => ({
        useAlert: () => mockUseAlert,
      }))
    })

    it('should have proper ARIA attributes', async () => {
      // We need to dynamically import to get the mocked version
      const { default: AlertMessageComponent } = await import('./AlertMessage')
      render(<AlertMessageComponent />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
    })

    it('should handle keyboard events on close button', async () => {
      const { default: AlertMessageComponent } = await import('./AlertMessage')
      render(<AlertMessageComponent />)

      const closeButton = screen.getByLabelText('close alert message')
      expect(closeButton).toBeInTheDocument()

      // Test keyboard navigation
      fireEvent.keyDown(closeButton, { key: 'Enter' })
      expect(mockClearAlert).toHaveBeenCalledTimes(1)

      fireEvent.keyDown(closeButton, { key: ' ' })
      expect(mockClearAlert).toHaveBeenCalledTimes(2)
    })
  })
})
