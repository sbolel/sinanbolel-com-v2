'use strict'

const fs = require('fs')
const path = require('path')
const { transformSync } = require('@swc/core')

const moduleCache = new Map()

function isReactRouterFile(filename) {
  return filename.includes(
    `${path.sep}node_modules${path.sep}react-router${path.sep}`
  )
}

function isTransformableModule(filename) {
  return isReactRouterFile(filename) || filename.endsWith('.mjs')
}

function transformReactRouterSource(source, filename) {
  const patchedSource = isReactRouterFile(filename)
    ? source.replaceAll('import.meta.hot', 'undefined')
    : source

  return transformSync(patchedSource, {
    filename,
    module: {
      type: 'commonjs',
    },
    jsc: {
      target: 'es2022',
      parser: {
        syntax: 'ecmascript',
        jsx: true,
        dynamicImport: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }).code
}

function loadModule(filePath) {
  const normalizedPath = path.normalize(filePath)

  if (moduleCache.has(normalizedPath)) {
    return moduleCache.get(normalizedPath).exports
  }

  const moduleRecord = { exports: {} }
  moduleCache.set(normalizedPath, moduleRecord)

  const source = fs.readFileSync(normalizedPath, 'utf8')
  const compiled = transformReactRouterSource(source, normalizedPath)
  const dirname = path.dirname(normalizedPath)

  const localRequire = (specifier) => {
    if (specifier.startsWith('.')) {
      return loadModule(path.resolve(dirname, specifier))
    }

    if (specifier.startsWith('node:')) {
      return require(specifier)
    }

    const resolvedPath = require.resolve(specifier, {
      paths: [dirname],
    })

    if (isTransformableModule(resolvedPath)) {
      return loadModule(resolvedPath)
    }

    return require(specifier)
  }

  const evaluator = new Function(
    'exports',
    'module',
    'require',
    '__filename',
    '__dirname',
    compiled
  )

  evaluator(
    moduleRecord.exports,
    moduleRecord,
    localRequire,
    normalizedPath,
    dirname
  )

  return moduleRecord.exports
}

function loadReactRouter(subpath) {
  return loadModule(
    path.join(
      __dirname,
      '../../node_modules/react-router/dist/production',
      subpath
    )
  )
}

module.exports = {
  loadReactRouter,
}
