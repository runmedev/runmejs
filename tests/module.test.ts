import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test, expect, beforeAll, afterAll } from 'vitest'

import { run, createServer } from '../src/index.js'

const originalRunmeBinDir = process.env.RUNME_BIN_DIR
let runmeBinDir: string

beforeAll(async () => {
  runmeBinDir = await fs.mkdtemp(path.join(os.tmpdir(), 'runmejs-bin-'))
  process.env.RUNME_BIN_DIR = runmeBinDir
})

afterAll(async () => {
  if (originalRunmeBinDir) {
    process.env.RUNME_BIN_DIR = originalRunmeBinDir
  } else {
    delete process.env.RUNME_BIN_DIR
  }
  await fs.rm(runmeBinDir, { recursive: true, force: true })
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
