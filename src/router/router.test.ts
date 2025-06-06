import router from './router'
import { RouteIds, Routes } from './constants'

describe('router configuration', () => {
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
})
