// Custom Vite plugin for Sass compilation using the modern API
import * as sass from 'sass'
import path from 'path'
import fs from 'fs'
import type { Plugin } from 'vite'

interface SassPluginOptions {
  outputStyle?: 'expanded' | 'compressed'
  includePaths?: string[]
  debug?: boolean
  [key: string]: unknown
}

/**
 * Create a Vite plugin that handles Sass compilation using the modern API
 * to avoid the legacy JS API deprecation warning.
 */
export default function sassPlugin(options: SassPluginOptions = {}): Plugin {
  // Allow debugging
  const debug = options.debug || false
  const log = debug ? console.log : (...args: any[]) => {}

  return {
    name: 'vite-plugin-modern-sass',
    enforce: 'pre', // Run before Vite's built-in CSS handling

    configResolved(config) {
      log('Vite config resolved:', config)

      // Disable built-in sass preprocessing if we're handling it
      if (config.css?.preprocessorOptions?.scss) {
        log('Disabling Vite built-in Sass preprocessing')
        config.css.preprocessorOptions.scss = {}
      }
    },

    async transform(code, id) {
      // Only handle .scss files and skip node_modules
      if (!id.endsWith('.scss') || id.includes('node_modules')) {
        return null
      }

      log(`Processing Sass file: ${id}`)

      // Use the modern Sass API
      try {
        const result = await sass.compileAsync(id, {
          style: options.outputStyle || 'expanded',
          loadPaths: [
            path.dirname(id),
            'node_modules',
            ...(Array.isArray(options.includePaths)
              ? options.includePaths
              : []),
          ],
          sourceMap: true,
          ...options,
        })

        log(`Successfully compiled ${id}`)

        return {
          code: result.css,
          map: result.sourceMap,
        }
      } catch (error) {
        console.error('Sass compilation error:', error)
        return null
      }
    },
  }
}
