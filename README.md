# Runme.js [![Test Changes](https://github.com/stateful/runmejs/actions/workflows/test.yaml/badge.svg)](https://github.com/stateful/runmejs/actions/workflows/test.yaml) [![npm version](https://badge.fury.io/js/runme.svg)](https://badge.fury.io/js/runme) [![Join us on Discord](https://img.shields.io/discord/878764303052865537?color=5b39df&label=Join%20us%20on%20Discord)](https://discord.com/invite/BQm8zRCBUY)

> A JavaScript module to use [Runme](https://runme.dev) in Node.js.

*Runme.js* contains the [Runme CLI](https://github.com/stateful/runme) and allows to access its functionality through a simple JavaScript interface. The CLI binary is downloaded and cached when the interface is first being used.

## Install

### Node.js

Install the module through NPM:

```sh
$ npm install runme
# or Yarn
$ yarn add runme
```

You can also install the package globally and it as a CLI, e.g.:

```sh
npm i -g runme
runme list
```

By default this package downloads the [Runme CLI](https://github.com/stateful/runme) when the interface is used for the first time. You can download it after running `npm install` by setting the `RUNME_DOWNLOAD_ON_INSTALL` environment flag. You can also modify the Runme version that is being installed by setting `RUNME_VERSION`, e.g.:

```sh
RUNME_DOWNLOAD_ON_INSTALL=1 RUNME_VERSION=1.0.0 npm install runme
npx runme --version # prints "runme version 1.0.0 (adae05c5b75351e9fe82acd595ac8086b6abf19b) on 2023-03-28T20:56:21Z"
```

## Usage

The module exposes the following methods:

### `run`

Run code cells from markdown files:

```ts { name="runExample" }
import { run } from 'runme'

const result = await run('.examples/example.md', 'helloWorld')
console.log(result) // outputs: { exitCode: 0, stdout: 'Hello World\r\n', stderr: '' }
```

Similar you can run `runSeries` and `runParallel` if you like to run multiple cells.

### `createServer`

Start a Runme execution session:

```ts
import { createServer, run } from 'runme'

const server = await createServer()

// execute `export FOO="bar"` from markdown code cell with id "export"
await run('.examples/example.md', 'export', server)

// execute `echo "exported FOO=$FOO"` from markdown code cell with id "print"
const result = await run('.examples/example.md', 'print', server)
console.log(result) // outputs: { exitCode: 0, stdout: 'exported FOO=bar\r\n', stderr: '' }
```

---

<p align="center">
  <small>
    Copyright 2023 © <a href="http://stateful.com/">Stateful</a> – Apache 2.0 License
  </small>
</p>
