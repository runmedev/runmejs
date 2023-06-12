exports.run = async function (workflows: any, args: any) {
  const { run } = await import('../index.js')
  return run(workflows, args)
}

exports.createServer = async function (serverAddress: any, args: any) {
  const { createServer } = await import('../index.js')
  return createServer(serverAddress, args)
}
