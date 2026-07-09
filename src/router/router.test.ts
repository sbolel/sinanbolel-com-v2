import router from './router'
import authLoader from './authLoader'
import { RouteIds, Routes } from './constants'
import getJWT from '@/utils/getJWT'

jest.mock('@/utils/getJWT', () => jest.fn())

const mockGetJWT = getJWT as jest.MockedFunction<typeof getJWT>

describe('router configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('includes expected paths', () => {
    const collectPaths = (routes: any[]): string[] =>
      routes.reduce((acc: string[], route) => {
        if (route.path) acc.push(route.path)
        if (route.children) acc.push(...collectPaths(route.children))
        return acc
      }, [])

    const paths = collectPaths(router.routes)
    expect(paths).toEqual(
      expect.arrayContaining([
        Routes.ROOT,
        Routes.AUTH,
        RouteIds.LOGIN,
        RouteIds.LOGOUT,
        Routes.DASHBOARD,
        Routes.NOT_FOUND,
      ])
    )
    const rootRoute = router.routes.find((r) => r.id === RouteIds.ROOT)
    expect(rootRoute).toBeTruthy()
  })

  test('authLoader resolves typed auth data for protected routes', async () => {
    mockGetJWT.mockResolvedValue('jwt-token')

    await expect(authLoader()).resolves.toEqual({ jwtToken: 'jwt-token' })
  })

  test(`authLoader redirects unauthenticated users to ${Routes.AUTH_LOGIN}`, async () => {
    const unauthorized = new Response(null, { status: 401 })

    mockGetJWT.mockRejectedValue(unauthorized)

    const redirectResponse = await authLoader().catch(
      (error) => error as Response
    )

    expect(redirectResponse).toBeInstanceOf(Response)
    expect(redirectResponse.status).toBe(302)
    expect(redirectResponse.headers.get('Location')).toBe(Routes.AUTH_LOGIN)
  })
})
