// Custom Vite plugin for Sass compilation using the modern API
import { compile, compileAsync } from 'sass'
import path from 'path'
import fs from 'fs'

/**
 * Create a Vite plugin that handles Sass compilation using the modern API
 * to avoid the legacy JS API deprecation warning.
 */
export default function sassPlugin(options = {}) {
  return {
    name: 'vite-plugin-modern-sass',
    transform(code, id) {
      // Only handle .scss files
      if (!id.endsWith('.scss')) {
        return null
      }

      // Use the modern Sass API
      try {
        const result = compile(id, {
          style: options.outputStyle || 'expanded',
          loadPaths: [
            path.dirname(id),
            'node_modules',
            ...(Array.isArray(options.includePaths)
              ? options.includePaths
              : []),
          ],
          ...options,
        })

        return {
          code: result.css.toString(),
          map: result.sourceMap,
        }
      } catch (error) {
        console.error('Sass compilation error:', error)
        return null
      }
    },
  }
}
