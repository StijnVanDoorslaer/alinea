import sade from 'sade'
// @ts-ignore
import pkg from '../../package.json'
import {ensureEnv} from './util/EnsureEnv.js'
import {ensureLibs} from './util/EnsureLibs.js'
import {ensureNode} from './util/EnsureNode.js'
import {forwardCommand} from './util/ForwardCommand.js'

const prog = sade('alinea')

const libs = {
  react: '18.0.0',
  'react-dom': '18.0.0'
}

prog
  .version(pkg.version)

  .command('init')
  .describe('Initialize a new Alinea project in the current directory')
  .action(async args => {
    ensureNode()
    ensureLibs(libs)
    const {init} = await import('./Init.js')
    return init(args)
  })

  .command('dev')
  .alias('serve')
  .describe('Start a development dashboard')
  .option('-c, --config', 'Config file location')
  .option('-d, --dir', 'Root directory of the project')
  .option('-p, --port', 'Port to listen on')
  .option('-b, --base', 'Base URL for previews')
  .option('--production', 'Use production backend')
  .option('--dev', 'Watch alinea sources')
  .action(async args => {
    ensureNode()
    ensureLibs(libs)
    ensureEnv(args.dir)
    process.env.NODE_ENV = args.production ? 'production' : 'development'
    const {serve} = await import('./Serve.js')
    return serve({
      ...args,
      alineaDev: args.dev,
      cwd: args.dir,
      base: args.base,
      onAfterGenerate: forwardCommand,
      configFile: args.config,
      cmd: 'dev'
    })
  })

  .command('build')
  .alias('generate')
  .describe('Generate types and content cache')
  .option('-c, --config', 'Config file location')
  .option('-d, --dir', 'Root directory of the project')
  .option('-w, --watch', 'Watch for changes to source files')
  .option(
    '--fix',
    'Any missing or incorrect properties will be overwritten by their default'
  )
  .action(async args => {
    ensureNode()
    ensureLibs(libs)
    ensureEnv(args.dir)
    process.env.NODE_ENV = 'production'
    if (args.fix) {
      const {generate} = await import('./Generate.js')
      for await (const _ of generate({
        ...args,
        cwd: args.dir,
        base: args.base,
        configFile: args.config,
        onAfterGenerate() {
          process.exit(0)
        },
        cmd: 'build'
      })) {
      }
      return
    }
    const {serve} = await import('./Serve.js')
    return serve({
      ...args,
      alineaDev: args.dev,
      cwd: args.dir,
      production: true,
      onAfterGenerate: env => {
        const isForwarding = forwardCommand(env)
        if (!isForwarding) process.exit(0)
      },
      configFile: args.config,
      cmd: 'build'
    })
  })

prog.parse(process.argv)
