import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'
import { test, expect, beforeAll } from 'vitest'

import { run, createServer } from '../src/index.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

beforeAll(async () => {
  await fs.rm(
    path.resolve(__dirname, '..', '.bin'),
    { recursive: true, force: true }
  )
})

test('run', async () => {
  const helloResult = await run(['helloWorld'])
  expect(helloResult.exitCode).toBe(0)
  expect(helloResult.stdout).toContain('Hello World')
  expect(helloResult.stderr).toBe('')

  const failResult = await run(['fail'], { ignoreReturnCode: true })
  expect(failResult.exitCode).toBe(1)
  expect(failResult.stdout).toContain('failed to run command "fail": exit code: 1')
  expect(failResult.stderr).toBe('')
})

test('createServer', async () => {
  const server = await createServer()
  const result = await run(['export', 'print'], { server })
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toContain('exported FOO=bar')
  expect(result.stderr).toBe('')
  server.kill()
})
