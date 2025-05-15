import { defineConfig, transformWithEsbuild, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react-swc'
import EnvironmentPlugin from 'vite-plugin-environment'
import { visualizer } from 'rollup-plugin-visualizer'
// Import our custom Sass plugin (TypeScript version)
import sassPlugin from './vite-sass-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {},
    // prettier-ignore
    global: ({}),
    // prettier-ignore
    _global: ({}),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    // Keep minimal configuration here as our plugin will handle Sass
    preprocessorOptions: {
      scss: {},
    },
  },
  plugins: [
    // Add our custom Sass plugin with debugging enabled only in development
    sassPlugin({
      outputStyle:
        process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
      debug: process.env.NODE_ENV !== 'production',
    }),
    react(),
    EnvironmentPlugin([
      'VITE_APP_TITLE',
      'VITE_CF_DOMAIN',
      'VITE_USER_POOL_ID',
      'VITE_USER_POOL_CLIENT_ID',
      'VITE_AWS_REGION',
      'VITE_IDP_ENABLED',
      'VITE_COGNITO_DOMAIN',
      'VITE_COGNITO_REDIRECT_SIGN_IN',
      'VITE_COGNITO_REDIRECT_SIGN_OUT',
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_DATABASE_URL',
      'VITE_FIREBASE_MEASUREMENT_ID',
      'VITE_FIREBASE_FIRESTORE_CHAT',
    ]),
    visualizer() as PluginOption,
    {
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
          return null
        }
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
  ],
  server: {
    watch: {
      ignored: ['**/coverage/**'],
    },
  },
  appType: 'spa',
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
