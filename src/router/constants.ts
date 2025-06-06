export enum RouteIds {
  ROOT = 'root',
  HOME = 'home',
  PROTECTED = 'app',
  DASHBOARD = 'dashboard',
  AUTH = 'auth',
  LOGIN = 'login',
  LOGOUT = 'logout',
  NOT_FOUND = '404',
}

export enum RouteNames {
  DASHBOARD = 'Dashboard',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
  NOT_FOUND = 'Not Found',
}

export enum Routes {
  ROOT = '/',
  HOME = `/${RouteIds.HOME}`,
  DASHBOARD = `/${RouteIds.PROTECTED}`,
  AUTH = `/${RouteIds.AUTH}/*`,
  AUTH_LOGIN = `/${RouteIds.AUTH}/${RouteIds.LOGIN}`,
  AUTH_LOGOUT = `/${RouteIds.AUTH}/${RouteIds.LOGOUT}`,
  NOT_FOUND = `/${RouteIds.NOT_FOUND}`,
}
