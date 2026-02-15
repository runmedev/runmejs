import cp, { type ChildProcess } from 'node:child_process'

import getPort from 'get-port'
import waitOn from 'wait-on'
import { exec } from '@actions/exec'

import { RunmeStream } from './utils.js'
import { download } from './installer.js'
import type { RunArgs, GlobalArgs, RunmeResult } from './types.js'

/**
 * Run a selected command
 * @param {string}   markdownFilePath  path to markdown file
 * @param {string}   workflows          name of cells to run
 * @param {RunArgs}  args              execution arguments
 * @returns {RunmeResult[]}
 */
export async function run (workflows: string[], args: RunArgs = {}): Promise<RunmeResult> {
  const runmePath = await download(args.version)

  if (!Array.isArray(workflows)) {
    throw new Error(`"run" command requires an array of workflows to run but found: ${workflows}`)
  }

  const execArgs = ['run']
  if (args.parallel) {
    execArgs.push('-p')
  }
  if (typeof args.server === 'string') {
    execArgs.push(`--server=${args.server}`)
  }
  const spawnargs = args.server && (args.server as ChildProcess).spawnargs
  if (spawnargs && spawnargs.lastIndexOf('--address') > -1) {
    const serverAddress = spawnargs[spawnargs.lastIndexOf('--address') + 1]
    execArgs.push(`--server=${serverAddress}`)
  }
  execArgs.push(...workflows)

  const outStream = new RunmeStream()
  const errStream = new RunmeStream()
  let exitCode = 1
  try {
    outStream.pipe(args.outStream || process.stdout)
    errStream.pipe(args.errStream || process.stderr)
    exitCode = (await exec(runmePath, execArgs, {
      ...args,
      ignoreReturnCode: true,
      outStream,
      errStream,
      env: {
        ...process.env as Record<string, string>,
      }
    })) ?? 1
  } catch (error) {
    if (error instanceof Error) {
      errStream.write(`Error executing runme: ${error.message}\n`)
    } else {
      errStream.write(`Error executing runme: ${error}\n`)
    }
  }

  return {
    exitCode,
    stdout: outStream.toString(),
    stderr: errStream.toString()
  }
}

/**
 * Start Runme server
 * @param {string | undefined} serverAddress address to start server on (@default `localhost:<free-port>`)
 * @returns {ChildProcess} instance of server child process
 */
export async function createServer (serverAddress?: string, args: GlobalArgs = {}) {
  const runmePath = await download(args.version)
  const address = serverAddress || `127.0.0.1:${await getPort()}`

  /**
   * need as it is not yet shipped by default
   */
  process.env.RUNME_SESSION_STRATEGY = 'recent'

  const server = cp.spawn(runmePath, ['server', '--address', address, '--runner'], {
    detached: true
  })
  await Promise.race([
    waitOn({ resources: [`tcp:${address}`] }),
    new Promise((_, reject) => server.on('exit', (exitCode, signal) => reject(new Error(`server exited unexpectedly (code: ${exitCode}, signal: ${signal})`))))
  ])

  return server
}
