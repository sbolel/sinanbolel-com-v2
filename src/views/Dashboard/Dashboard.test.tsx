import { BrowserRouter, useLoaderData } from 'react-router'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLoaderData: jest.fn(),
}))

beforeEach(() => {
  ;(useLoaderData as jest.Mock).mockReturnValue({ username: 'alice' })
})

test('renders the username returned from the loader', async () => {
  render(<Dashboard />, { wrapper: BrowserRouter })
  expect(screen.getByText(/Welcome User/i)).toHaveTextContent(
    'Welcome User alice'
  )
})
