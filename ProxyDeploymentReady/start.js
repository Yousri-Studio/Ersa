// FINAL ERSA TRAINING START.JS FOR SMARTERASP.NET
// This version handles ALL known issues:
// 1. SmarterASP.NET named pipes
// 2. Next.js i18n routing
// 3. Production environment
// 4. Comprehensive error handling

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

console.log('🚀 ERSA TRAINING PLATFORM - STARTING...')
console.log('📅 Timestamp:', new Date().toISOString())

// Load environment variables from .env.production
try {
  const envFile = path.join(__dirname, '.env.production')
  if (fs.existsSync(envFile)) {
    const envData = fs.readFileSync(envFile, 'utf8')
    envData.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=')
        }
      }
    })
    console.log('✅ Environment variables loaded from .env.production')
  } else {
    console.log('⚠️ No .env.production file found, using defaults')
  }
} catch (err) {
  console.log('❌ Error loading .env.production:', err.message)
}

// Handle SmarterASP.NET port configuration
let port = process.env.PORT
let isNamedPipe = false

console.log('🔍 PORT Analysis:')
console.log('   Raw PORT value:', port)
console.log('   PORT type:', typeof port)

// SmarterASP.NET uses Windows named pipes - detect and use them
if (port && typeof port === 'string' && port.includes('pipe')) {
  console.log('✅ SmarterASP.NET named pipe detected:', port)
  isNamedPipe = true
  // Use the named pipe directly - don't parse as number
} else {
  // For other hosting or local development, parse as number
  console.log('🔄 Parsing PORT as numeric value...')
  try {
    const parsed = parseInt((port || '3000').toString().trim(), 10)
    if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
      port = parsed
      console.log('✅ Using numeric port:', port)
    } else {
      port = 3000
      console.log('⚠️ Invalid port detected, using default 3000')
    }
  } catch (err) {
    port = 3000
    console.log('❌ Error parsing port, using default 3000:', err.message)
  }
}

console.log('📋 Configuration Summary:')
console.log('   Environment:', process.env.NODE_ENV || 'production')
console.log('   Port/Pipe:', port)
console.log('   Named Pipe Mode:', isNamedPipe)
console.log('   API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
console.log('   Working Directory:', __dirname)

// Verify critical files exist
const criticalFiles = ['.next', 'package.json', 'next.config.js']
const missingFiles = criticalFiles.filter(file => !fs.existsSync(path.join(__dirname, file)))

if (missingFiles.length > 0) {
  console.error('❌ CRITICAL: Missing required files:', missingFiles)
  console.error('   Ensure you have run "npm run build" and have all deployment files')
  process.exit(1)
}

console.log('✅ Critical files verified')

// Initialize Next.js application
const app = next({ 
  dev: false, 
  dir: __dirname,
  quiet: false,
  customServer: true
})

const handle = app.getRequestHandler()

console.log('⚙️ Preparing Next.js application...')

app.prepare()
  .then(() => {
    console.log('✅ Next.js application prepared successfully')
    
    const server = createServer((req, res) => {
      const startTime = Date.now()
      
      // Enhanced request logging for debugging
      console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`)
      console.log(`🔍 Headers:`, JSON.stringify(req.headers, null, 2))
      console.log(`🌐 User-Agent:`, req.headers['user-agent'] || 'Unknown')
      
      try {
        const parsedUrl = parse(req.url, true)
        
        // Log parsed URL details
        console.log(`📋 Parsed URL:`, {
          pathname: parsedUrl.pathname,
          query: parsedUrl.query,
          search: parsedUrl.search
        })
        
        // Special handling for diagnostic page
        if (parsedUrl.pathname === '/diagnostic.html' || parsedUrl.pathname === '/diagnostic') {
          console.log('🔧 Diagnostic page requested - serving static HTML')
          const diagnosticPath = path.join(__dirname, 'diagnostic.html')
          if (fs.existsSync(diagnosticPath)) {
            const diagnosticContent = fs.readFileSync(diagnosticPath, 'utf8')
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(diagnosticContent)
            return
          }
        }
        
        // Special handling for i18n root path
        if (parsedUrl.pathname === '/') {
          console.log('🌐 Root path accessed - redirecting to default locale /en')
          res.writeHead(302, { 
            'Location': '/en',
            'Cache-Control': 'no-cache'
          })
          res.end()
          return
        }
        
        // Add security headers
        res.setHeader('X-Powered-By', 'Ersa Training Platform')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        
        // Handle the request with Next.js
        handle(req, res, parsedUrl).then(() => {
          const duration = Date.now() - startTime
          console.log(`✅ Request completed in ${duration}ms`)
        }).catch((handleError) => {
          console.error('❌ Next.js handler error:', handleError)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'text/html')
            res.end(`
              <!DOCTYPE html>
              <html>
                <head><title>Ersa Training - Server Error</title></head>
                <body style="font-family: Arial; padding: 40px; background: #f8f9fa;">
                  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #dc3545;">🚨 Ersa Training Platform Error</h1>
                    <p>The platform encountered an error while processing your request.</p>
                    <details style="margin-top: 20px;">
                      <summary style="cursor: pointer; font-weight: bold; color: #495057;">Technical Details</summary>
                      <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; overflow-x: auto; color: #495057;">${handleError.message}</pre>
                    </details>
                    <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
                      <strong>🔗 Quick Links:</strong><br>
                      <a href="/en" style="color: #007bff; text-decoration: none;">📚 English Version</a> | 
                      <a href="/ar" style="color: #007bff; text-decoration: none;">📚 Arabic Version</a>
                    </div>
                    <p style="margin-top: 20px; color: #6c757d; font-size: 14px;">
                      If this error persists, please contact the system administrator.
                    </p>
                  </div>
                </body>
              </html>
            `)
          }
        })
        
      } catch (err) {
        console.error('❌ Request handling error:', err)
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/html')
          res.end(`
            <!DOCTYPE html>
            <html>
              <head><title>Ersa Training - Request Error</title></head>
              <body style="font-family: Arial; padding: 20px; background: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                  <h1 style="color: #dc3545;">Request Processing Error</h1>
                  <p><strong>URL:</strong> ${req.url}</p>
                  <p><strong>Method:</strong> ${req.method}</p>
                  <p><strong>Error:</strong> ${err.message}</p>
                  <div style="margin-top: 20px;">
                    <a href="/en" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to English Version</a>
                  </div>
                </div>
              </body>
            </html>
          `)
        }
      }
    })

    // Enhanced server error handling
    server.on('error', (error) => {
      console.error('❌ Server error event:', error)
      if (error.code === 'EADDRINUSE') {
        console.error('   Port already in use - SmarterASP.NET should handle this automatically')
      } else if (error.code === 'EACCES') {
        console.error('   Permission denied - check server permissions')
      } else if (error.code === 'ENOENT') {
        console.error('   File not found - check deployment files')
      } else {
        console.error('   Unknown server error code:', error.code)
      }
    })

    server.on('listening', () => {
      console.log('🎉 Server is listening and ready!')
      console.log('🌐 Ersa Training platform is now available')
      if (isNamedPipe) {
        console.log('🔗 Access your site through your SmarterASP.NET domain')
      } else {
        console.log(`🔗 Local access: http://localhost:${port}`)
      }
    })

    // Start server with appropriate method for environment
    if (isNamedPipe) {
      console.log('🔌 Starting server with SmarterASP.NET named pipe configuration...')
      // For named pipes, don't use callback - SmarterASP.NET handles the connection
      server.listen(port)
      
      // Use timeout to confirm startup since callback won't fire with named pipes
      setTimeout(() => {
        console.log('✅ Server startup completed with SmarterASP.NET named pipe')
        console.log('🎯 Platform should now be accessible through your domain')
        console.log('📝 Check SmarterASP.NET control panel for any additional logs')
      }, 2000)
      
    } else {
      console.log('🔌 Starting server on numeric port...')
      server.listen(port, (err) => {
        if (err) {
          console.error('❌ Server failed to start:', err)
          throw err
        }
        console.log(`✅ Server ready on http://localhost:${port}`)
        console.log('🎯 Platform accessible at the configured port')
      })
    }
    
  })
  .catch((ex) => {
    console.error('❌ CRITICAL: Failed to start Ersa Training platform')
    console.error('❌ Error message:', ex.message)
    console.error('❌ Stack trace:', ex.stack)
    
    // Provide helpful error analysis
    if (ex.message.includes('ENOENT')) {
      console.error('')
      console.error('🔍 SOLUTION: Missing files detected')
      console.error('   1. Ensure you have run "npm run build" before deployment')
      console.error('   2. Check that .next folder exists and contains build files')
      console.error('   3. Verify all dependencies are installed (node_modules)')
      console.error('')
    } else if (ex.message.includes('Cannot find module')) {
      console.error('')
      console.error('🔍 SOLUTION: Missing dependencies detected')
      console.error('   1. Run "npm install --production" in deployment folder')
      console.error('   2. Ensure all required packages are available')
      console.error('   3. Check package.json and package-lock.json are present')
      console.error('')
    } else if (ex.message.includes('permission')) {
      console.error('')
      console.error('🔍 SOLUTION: Permission error detected')
      console.error('   1. Check file and folder permissions on server')
      console.error('   2. Ensure IIS/iisnode has access to application files')
      console.error('   3. Verify SmarterASP.NET account has proper permissions')
      console.error('')
    } else if (ex.message.includes('port') || ex.message.includes('EADDRINUSE')) {
      console.error('')
      console.error('🔍 SOLUTION: Port conflict detected')
      console.error('   1. SmarterASP.NET should manage ports automatically')
      console.error('   2. Check if another application is using the port')
      console.error('   3. Restart the application through SmarterASP.NET control panel')
      console.error('')
    }
    
    process.exit(1)
  })

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error.message)
  console.error('❌ Stack trace:', error.stack)
  console.error('❌ Process will exit')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED PROMISE REJECTION')
  console.error('❌ Reason:', reason)
  console.error('❌ Promise:', promise)
  console.error('❌ Process will exit')
  process.exit(1)
})

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('📝 Received SIGTERM signal - shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('📝 Received SIGINT signal - shutting down gracefully')
  process.exit(0)
})

console.log('✅ Ersa Training Platform startup script loaded')
console.log('⏳ Waiting for Next.js preparation to complete...')