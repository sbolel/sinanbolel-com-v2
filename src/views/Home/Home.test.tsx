import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from './Home'

jest.mock('@/components/Chat/Chat', () => () => (
  <div data-testid="chat-component">Chat</div>
))
jest.mock('@/views/Home/Home.module.scss', () => ({}), { virtual: true })

test('toggles chat dialog when button is clicked', async () => {
  render(<Home />)
  const button = screen.getByRole('button', { name: /open chat/i })
  expect(screen.queryByTestId('chat-component')).toBeNull()
  fireEvent.click(button)
  expect(screen.getByTestId('chat-component')).toBeInTheDocument()
  fireEvent.click(button)
  await waitFor(() => {
    expect(screen.queryByTestId('chat-component')).toBeNull()
  })
})
