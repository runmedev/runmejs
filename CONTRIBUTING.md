---
cwd: ./
runme:
  id: 01HF7GMQ6PE0NNKN60P50JEZ17
  version: v3
---

# Contributing

This project maintains the following workflows and Tasks. You can start contributing by cloning the code base, either manually or by clicking on:

[![Run with Runme](https://badgen.net/badge/Run%20with/Runme/5B3ADF?icon=https://runme.dev/img/logo.svg)](https://runme.dev/api/runme?repository=https%3A%2F%2Fgithub.com%2Fstateful%2Frunmejs.git&fileToOpen=CONTRIBUTING.md)

Then install it's dependencies via:

```sh {"id":"01HF7GMQ6NTPMHCVN4BM9FMCGW","name":"install"}
npm ci
```

## Workflows

### Build Project

To build the project, run:

```sh {"id":"01HF7GMQ6NTPMHCVN4BNVQVTST","name":"build"}
./node_modules/.bin/runme run clean compile
```

### Test Project

To run the entire test pipeline, call:

```sh {"id":"01HF7GMQ6NTPMHCVN4BS6AB0BM","name":"test"}
./node_modules/.bin/runme run test:lint test:unit test:cjs
```

This will run [Eslint](https://eslint.org/) checks:

```sh {"id":"01HF7GMQ6NTPMHCVN4BTYD944N","name":"test:lint"}
npx eslint src tests
```

unit tests via [Vitest](https://vitest.dev/):

```sh {"id":"01HF7GMQ6NTPMHCVN4BY0W782F","name":"test:unit"}
npx vitest --config ./vitest.config.ts --retry=3
```

Update snapshots used in tests if necesary:

```sh {"id":"01HPEYC6NE0WP6X2KTGQAHZVSN","name":"test:unit:snapshots"}
npx vitest --config ./vitest.config.ts -u
```

and verifies that the package can be imported in a CJS environment:

```sh {"cwd":"./tests/cjs","id":"01HF7GMQ6NTPMHCVN4BYGWDAY0","name":"test:cjs"}
npx ts-node ./cjs.test.ts
```

### Watch Files

To have the source files automatically re-compiled after changing, run:

```sh {"id":"01HF7GMQ6NTPMHCVN4C05RFBVF","name":"watch"}
npx tsc -p ./tsconfig.json --watch
```

## Tasks

Workflows consist of the following individual tasks:

### Clean Project

Remove build files and other log artifacts:

```sh {"id":"01HF7GMQ6NTPMHCVN4C220SZSN","name":"clean"}
npx rimraf dist coverage ./.bin
```

### Compile

To compile source files via TypeScript, run:

```sh {"id":"01HF7GMQ6NTPMHCVN4C425DX9M","name":"compile"}
npx tsc -p ./tsconfig.json
cp ./src/cjs/package.json ./dist/cjs
```
