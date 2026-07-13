import os from 'node:os'
import fs from 'node:fs/promises'
import cp from 'node:child_process'

import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest'
import fetch from 'node-fetch'

import { download } from '../src/installer.js'
import { runme } from '../src/cli.js'

vi.mock('node:fs/promises', () => ({
  default: {
    access: vi.fn().mockResolvedValue(true),
    mkdir: vi.fn(),
    readFile: vi.fn().mockResolvedValue('')
  }
}))

vi.mock('node:child_process', () => ({
  default: {
    spawn: vi.fn().mockReturnValue({ on: vi.fn() }),
    exec: vi.fn((command: string, cb: (error: Error | undefined, result: any) => void) => cb(undefined, { stdout: '', stderr: '' }))
  }
}))

vi.mock('node:os', () => ({
  default: {
    type: vi.fn().mockReturnValue('Darwin'),
    arch: () => 'arm64',
    platform: vi.fn().mockReturnValue('darwin')
  }
}))

vi.mock('node:stream', () => ({
  Transform: class {},
  default: {
    pipeline: (...args: any) => args[args.length - 1]()
  }
}))

vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({ body: 'binaryfile' })
}))

const consoleLog = console.log.bind(console)
const consoleTable = console.table.bind(console)
beforeAll(() => {
  console.log = vi.fn()
  console.table = vi.fn()
})

beforeEach(() => {
  delete process.env.RUNME_BIN_DIR
  delete process.env.RUNME_DOWNLOAD_BASE_URL
  vi.mocked(fs.access).mockResolvedValue(undefined)
  vi.mocked(fs.mkdir).mockClear()
  vi.mocked(fetch).mockClear()
  vi.mocked(os.type).mockReturnValue('Darwin')
  vi.mocked(os.platform).mockReturnValue('darwin')
  vi.mocked(console.log).mockClear()
  vi.mocked(console.table).mockClear()
})

describe('CLI Download', () => {
  it('does not download if already downloaded', async () => {
    expect(await download()).toStrictEqual(expect.any(String))
    expect(fetch).toBeCalledTimes(0)
  })

  it('can run already downloaded file', async () => {
    process.argv = ['foo', 'bar', 'list', '--help']
    await runme()
    expect(cp.spawn).toBeCalledTimes(1)
    expect(vi.mocked(cp.spawn).mock.calls[0][0]).toContain('runme list --help')

    vi.mocked(os.platform).mockReturnValue('win32')
    await runme()
    expect(cp.spawn).toBeCalledTimes(2)
    expect(vi.mocked(cp.spawn).mock.calls[1][0]).toContain('runme.exe list --help')
  })

  it('downloads binary from GitHub', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ups'))
    expect(await download()).toStrictEqual(expect.any(String))
    expect(fetch).toBeCalledTimes(1)
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('https://downloads.runme.dev/runme/latest/')
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('runme_darwin_arm64.tar.gz')
  })

  it('supports custom download base URLs', async () => {
    process.env.RUNME_DOWNLOAD_BASE_URL = 'https://example.com/runme'
    vi.mocked(fs.access).mockRejectedValue(new Error('ups'))
    vi.mocked(fetch).mockClear()

    expect(await download('3.17.1')).toStrictEqual(expect.any(String))
    expect(vi.mocked(fetch).mock.calls[0][0])
      .toBe('https://example.com/runme/3.17.1/runme_darwin_arm64.tar.gz')
  })

  it('supports custom binary directories', async () => {
    process.env.RUNME_BIN_DIR = '/tmp/runmejs-test-bin'
    vi.mocked(fs.access).mockRejectedValue(new Error('ups'))

    expect(await download()).toBe('/tmp/runmejs-test-bin/runme')
    expect(fs.mkdir).toBeCalledWith('/tmp/runmejs-test-bin', { recursive: true })
  })

  it('fails if environment is not supported', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ups'))
    vi.mocked(os.type).mockReturnValue('foobar')
    await expect(download()).rejects.toThrow(/Platform not supported/)
    expect(console.log).toBeCalledTimes(1)
    expect(vi.mocked(console.log).mock.calls[0][0])
      .toContain('Platform with type "foobar" and architecture "arm64" is not supported')
    expect(console.table).toBeCalledTimes(1)
  })
})

afterAll(() => {
  delete process.env.RUNME_BIN_DIR
  delete process.env.RUNME_DOWNLOAD_BASE_URL
  vi.restoreAllMocks()
  console.log = consoleLog
  console.table = consoleTable
})
