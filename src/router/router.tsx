/**
 * Component that renders all routes in the application.
 * @module router/router
 * @see {@link dashboard/main} for usage.
 */
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import RootProvider from '@/Root'
import ErrorBoundary from '@/components/ErrorBoundary'
import NavigateTo from '@/components/react-router/NavigateTo'
import authLoader from '@/router/authLoader'
import { RouteIds, Routes } from '@/router/constants'
import configureCognito from '@/utils/configureCognito'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import Home from '@/views/Home/Home'
import SignIn from '@/views/SignIn/SignIn'
import SignOut from '@/views/SignOut/SignOut'
import Dashboard from '@/views/Dashboard/Dashboard'
import dashboardLoader from '@/views/Dashboard/Dashboard.loader'

/**
 * The hash router for the application that defines routes
 *  and specifies the loaders for routes with dynamic data.
 * @type {React.ComponentType} router - The browser router
 * @see {@link https://reactrouter.com/web/api/BrowserRouter BrowserRouter}
 * @see {@link https://reactrouter.com/en/main/route/loader loader}
 */
const styleOverrides = Object.freeze({
  __html: 'body, html { background-color: #fff; }',
}) as { __html: string }

const router = createBrowserRouter([
  {
    id: RouteIds.ROOT,
    path: '/',
    element: <RootProvider />,
    errorElement: <ErrorBoundary />,
    loader: configureCognito,
    children: [
      {
        element: <Home />,
        id: RouteIds.HOME,
        index: true,
      },
      {
        id: RouteIds.AUTH,
        path: Routes.AUTH,
        element: (
          <Box width="100%" height="100%">
            <style dangerouslySetInnerHTML={styleOverrides}></style>
            <Outlet />
          </Box>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          {
            id: RouteIds.LOGIN,
            path: RouteIds.LOGIN,
            element: <SignIn />,
            errorElement: <ErrorBoundary />,
          },
          {
            id: RouteIds.LOGOUT,
            path: RouteIds.LOGOUT,
            element: <SignOut />,
            errorElement: <ErrorBoundary />,
          },
        ],
      },
      {
        path: Routes.DASHBOARD,
        id: RouteIds.PROTECTED,
        element: <AppLayout />,
        errorElement: <ErrorBoundary />,
        loader: authLoader,
        children: [
          {
            id: RouteIds.DASHBOARD,
            element: <Dashboard />,
            errorElement: <ErrorBoundary />,
            loader: dashboardLoader,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NavigateTo route={Routes.ROOT} />,
  },
])

export default router
