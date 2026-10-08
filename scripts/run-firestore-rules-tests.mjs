import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const firebaseConfig = JSON.parse(
  readFileSync('firebase.rules-test.json', 'utf8')
)
const testCommand = './scripts/run-firestore-rules-node-test.sh'
const shellEscape = (value) => `'${value.replaceAll("'", "'\\''")}'`

const getAvailablePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer()

    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()

      if (!address || typeof address === 'string') {
        server.close(() =>
          reject(new Error('Unable to allocate Firestore port'))
        )
        return
      }

      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve(address.port)
      })
    })
  })

const run = async () => {
  const port = await getAvailablePort()
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'firestore-rules-'))
  const configPath = path.join(tempDir, 'firebase.rules-test.json')

  firebaseConfig.emulators.firestore.port = port
  firebaseConfig.firestore.rules = path.resolve(firebaseConfig.firestore.rules)
  writeFileSync(configPath, `${JSON.stringify(firebaseConfig, null, 2)}\n`)

  try {
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(
        `firebase emulators:exec --config ${shellEscape(configPath)} --only firestore ${shellEscape(testCommand)}`,
        [],
        {
          env: {
            ...process.env,
            FIRESTORE_RULES_NODE_BINARY: process.execPath,
          },
          shell: true,
          stdio: 'inherit',
        }
      )

      child.on('error', reject)
      child.on('exit', (code, signal) => {
        if (signal) {
          reject(
            new Error(`Firestore rules test interrupted by signal ${signal}`)
          )
          return
        }

        resolve(code ?? 1)
      })
    })

    process.exit(exitCode)
  } finally {
    rmSync(tempDir, { force: true, recursive: true })
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
