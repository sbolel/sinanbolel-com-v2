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
      'npm:': '/node_modules/',
    },
  },
  css: {
    // Keep minimal configuration here as our plugin will handle Sass
    preprocessorOptions: {
      scss: {},
    },
  },
  plugins: [
    // Add our custom Sass plugin with debugging enabled
    sassPlugin({
      outputStyle: 'expanded',
      debug: true,
    }),
    react(),
    EnvironmentPlugin('all'),
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
