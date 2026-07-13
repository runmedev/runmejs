import cp from 'node:child_process'
import { describe, it, expect, vi, afterAll } from 'vitest'

import { download } from '../src/installer.js'
import { runme } from '../src/cli.js'

vi.mock('node:child_process', () => ({
  default: {
    spawn: vi.fn().mockReturnValue({ on: vi.fn() }),
    exec: vi.fn()
  }
}))

vi.mock('../src/installer.js', () => ({
  download: vi.fn().mockResolvedValue('/tmp/runme')
}))

describe('RunmeJS CLI', () => {
  it('supports defauls from config file', async () => {
    process.argv = ['nodepath', 'binPath', 'run', '--chdir=./examples', '--filename=example.md']
    await runme()
    expect(download).toBeCalledTimes(1)
    expect(
      vi.mocked(cp.spawn).mock.calls[0][0]
        .endsWith('/tmp/runme run --chdir=./examples --filename=example.md')
    ).toBe(true)
  })
})

afterAll(() => {
  vi.restoreAllMocks()
})
