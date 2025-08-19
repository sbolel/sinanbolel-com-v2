import { describe, it, expect } from '@jest/globals'

describe('Content Security Policy', () => {
  it('should have CSP meta tag in index.html', async () => {
    // Read the index.html file from the repository
import * as fs from 'fs'
import * as path from 'path'
import { describe, it, expect } from '@jest/globals'

describe('Content Security Policy', () => {
  it('should have CSP meta tag in index.html', async () => {
    // Read the index.html file from the repository
    
    
    const indexHtmlPath = path.join(__dirname, '../../index.html')
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

    // Check that CSP meta tag exists
    expect(indexHtml).toContain('http-equiv="Content-Security-Policy"')
    expect(indexHtml).toContain("default-src 'self'")
    expect(indexHtml).toContain("script-src 'self'")
    expect(indexHtml).toContain("style-src 'self' 'unsafe-inline'")
    expect(indexHtml).toContain("img-src 'self' data:")
    expect(indexHtml).toContain("font-src 'self' data:")
  })

  it('should have correct CSP directives for external services', async () => {
    const fs = require('fs')
    const indexHtmlPath = path.join(__dirname, '../../index.html')
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

    // Check for external service domains
    expect(indexHtml).toContain('https://*.googleapis.com')
    expect(indexHtml).toContain('https://*.firebaseio.com')
    expect(indexHtml).toContain('https://cognito-idp.us-east-1.amazonaws.com')
  })

  it('should have security directives in CSP', async () => {
    const fs = require('fs')
    const indexHtmlPath = path.join(__dirname, '../../index.html')
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

    // Check for security directives
    expect(indexHtml).toContain("object-src 'none'")
    expect(indexHtml).toContain("base-uri 'self'")
    expect(indexHtml).toContain('upgrade-insecure-requests')
    expect(indexHtml).toContain(
      "'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='"
    )
  })
})
