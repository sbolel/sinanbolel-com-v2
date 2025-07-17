import type { Plugin } from 'vite'

interface CSPPluginOptions {
  policy?: string
}

/**
 * Vite plugin to add Content Security Policy headers during development
 */
export function cspPlugin(options: CSPPluginOptions = {}): Plugin {
  const defaultPolicy = [
    "default-src 'self'",
    "script-src 'self' 'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='", // Allow specific inline script hash
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Material-UI
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://cognito-idp.us-east-1.amazonaws.com https://*.firebaseio.com https://*.firestore.googleapis.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

  const policy = options.policy || defaultPolicy

  return {
    name: 'csp-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Content-Security-Policy', policy)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Content-Security-Policy', policy)
        next()
      })
    },
  }
}

export default cspPlugin
