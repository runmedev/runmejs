import os from 'node:os'
import url from 'node:url'
import util from 'node:util'
import path from 'node:path'
import zlib from 'node:zlib'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import stream, { Readable } from 'node:stream'

import tar from 'tar-fs'
import fetch from 'node-fetch'
import unzipper from 'unzipper'

import { hasAccess } from './utils.js'
import { SUPPORTE_PLATFORMS } from './constants.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const streamPipeline = util.promisify(stream.pipeline)
const DEFAULT_RUNME_DOWNLOAD_BASE_URL = 'https://downloads.runme.dev/runme'

/**
 * download runme binary from GitHub
 * @returns file path to downloaded binary
 */
export async function download (runmeVersion = process.env.RUNME_VERSION || 'latest') {
  const targetDir = path.resolve(process.env.RUNME_BIN_DIR || path.resolve(__dirname, '..', '.bin'))
  const isWindows = os.platform() === 'win32'
  const binaryFilePath = path.resolve(targetDir, `runme${isWindows ? '.exe' : ''}`)

  if (await hasAccess(binaryFilePath)) {
    return binaryFilePath
  }

  const platform = getPlatformMetadata()
  if (!platform) {
    throw new Error('Platform not supported')
  }

  const [version, type, target, ext] = [runmeVersion, platform.TYPE.toLocaleLowerCase(), platform.TARGET, platform.EXTENSION]
  const downloadBaseUrl = (process.env.RUNME_DOWNLOAD_BASE_URL || DEFAULT_RUNME_DOWNLOAD_BASE_URL).replace(/\/$/, '')
  const url = `${downloadBaseUrl}/${version}/runme_${type.replace('_nt', '')}_${target}.${ext}`
  const res = await fetch(url)

  if (!res.body) {
    throw new Error(`Failed to download binary (statusCode ${res.status})`)
  }

  await fsp.mkdir(targetDir, { recursive: true })

  if (ext === 'zip') {
    await downloadZip(res.body, binaryFilePath)
    return binaryFilePath
  }

  await streamPipeline(res.body, zlib.createGunzip(), tar.extract(targetDir))
  return binaryFilePath
}

/**
 * Determine current running platform and determine if it is supported
 * @returns platform information if supported, undefined otherwise
 */
const getPlatformMetadata = () => {
  const type = os.type()
  const architecture = os.arch()

  for (const supportedPlatform of SUPPORTE_PLATFORMS) {
    if (
      type === supportedPlatform.TYPE &&
      architecture === supportedPlatform.ARCHITECTURE
    ) {
      return supportedPlatform
    }
  }

  console.log(
    `Platform with type "${type}" and architecture "${architecture}" is not supported ` +
    'by "runme".\nYour system must be one of the following:\n'
  )
  console.table(SUPPORTE_PLATFORMS)
}

function downloadZip(body: NodeJS.ReadableStream, binaryPath: string) {
  const stream = Readable.from(body).pipe(unzipper.Parse())
  const promiseChain: Promise<void>[] = [
    new Promise((resolve, reject) => {
      stream.on('close', () => resolve())
      stream.on('error', () => reject())
    })
  ]

  stream.on('entry', (entry) => {
    const fileName = entry.path
    const type = entry.type
    if (type === 'File' && path.extname(fileName) === '.exe') {
      const execStream = entry.pipe(fs.createWriteStream(binaryPath))
      promiseChain.push(new Promise((resolve, reject) => {
        execStream.on('close', () => resolve())
        execStream.on('error', reject)
      }))
    }
  })

  return Promise.all(promiseChain)
}
