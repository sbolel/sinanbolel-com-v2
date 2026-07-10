import React, { useContext } from 'react'
import { render, screen } from '@testing-library/react'
import Root from '@/Root'
import { ChatContext } from './ChatContext'

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router')

  return {
    ...actual,
    Outlet: () => {
      const { state } = useContext(ChatContext)

      return (
        <div data-testid="chat-context-state">
          {JSON.stringify({
            chatId: state.chatId,
            messages: state.messages.length,
            showCaption: state.showCaption,
          })}
        </div>
      )
    },
  }
})

jest.mock('@/store/auth/AuthProvider', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

jest.mock('@/hooks/useAlert', () => ({
  AlertProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

jest.mock('@/hooks/useDialog', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

describe('Root chat provider wiring', () => {
  test('provides chat context to routed children', () => {
    render(<Root />)

    expect(screen.getByTestId('chat-context-state')).toHaveTextContent(
      JSON.stringify({
        chatId: null,
        messages: 0,
        showCaption: false,
      })
    )
  })
})
