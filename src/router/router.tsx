/**
 * Component that renders all routes in the application.
 * @module router/router
 * @see {@link dashboard/main} for usage.
 */
import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import RootProvider from '@/Root'
import ErrorBoundary from '@/components/ErrorBoundary'
import Fallback from '@/components/SimpleLoadingFallback'
import NavigateTo from '@/components/react-router/NavigateTo'
import authLoader from '@/router/authLoader'
import { RouteIds, Routes } from '@/router/constants'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'
import dashboardLoader from '@/views/Dashboard/Dashboard.loader'

const Home = lazy(() => import('@/views/Home/Home'))
const SignIn = lazy(() => import('@/views/SignIn/SignIn'))
const SignOut = lazy(() => import('@/views/SignOut/SignOut'))
const Dashboard = lazy(() => import('@/views/Dashboard/Dashboard'))
const NotFound = lazy(() => import('@/views/NotFound/NotFound'))

/**
 * The hash router for the application that defines routes
 *  and specifies the loaders for routes with dynamic data.
 * @type {React.ComponentType} router - The browser router
 * @see {@link https://reactrouter.com/web/api/BrowserRouter BrowserRouter}
 * @see {@link https://reactrouter.com/en/main/route/loader loader}
 */

const router = createBrowserRouter([
  {
    id: RouteIds.ROOT,
    path: Routes.ROOT,
    element: <RootProvider />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: (
          <Suspense fallback={<Fallback />}>
            <Home />
          </Suspense>
        ),
        id: RouteIds.HOME,
        index: true,
      },
      {
        id: RouteIds.AUTH,
        path: Routes.AUTH,
        element: <AuthLayout />,
        children: [
          {
            id: RouteIds.LOGIN,
            path: RouteIds.LOGIN,
            element: (
              <Suspense fallback={<Fallback />}>
                <SignIn />
              </Suspense>
            ),
          },
          {
            id: RouteIds.LOGOUT,
            path: RouteIds.LOGOUT,
            element: (
              <Suspense fallback={<Fallback />}>
                <SignOut />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: Routes.DASHBOARD,
        id: RouteIds.PROTECTED,
        element: <AppLayout />,
        loader: authLoader,
        children: [
          {
            id: RouteIds.DASHBOARD,
            element: (
              <Suspense fallback={<Fallback />}>
                <Dashboard />
              </Suspense>
            ),
            loader: dashboardLoader,
          },
        ],
      },
      {
        id: RouteIds.NOT_FOUND,
        path: Routes.NOT_FOUND,
        element: (
          <Suspense fallback={<Fallback />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NavigateTo route={Routes.NOT_FOUND} />,
  },
])

export default router
