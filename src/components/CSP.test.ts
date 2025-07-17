import { describe, it, expect } from '@jest/globals'

describe('Content Security Policy', () => {
  it('should have CSP meta tag in index.html', async () => {
    // Read the index.html file from the repository
    const fs = require('fs')
    const path = require('path')
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
    const path = require('path')
    const indexHtmlPath = path.join(__dirname, '../../index.html')
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

    // Check for external service domains
    expect(indexHtml).toContain('https://*.googleapis.com')
    expect(indexHtml).toContain('https://*.firebaseio.com')
    expect(indexHtml).toContain('https://cognito-idp.*.amazonaws.com')
  })

  it('should have security directives in CSP', async () => {
    const fs = require('fs')
    const path = require('path')
    const indexHtmlPath = path.join(__dirname, '../../index.html')
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

    // Check for security directives
    expect(indexHtml).toContain("object-src 'none'")
    expect(indexHtml).toContain("base-uri 'self'")
    expect(indexHtml).toContain("frame-ancestors 'none'")
    expect(indexHtml).toContain('upgrade-insecure-requests')
  })
})
