#!/usr/bin/env yarn run ts-node -r tsconfig-paths/register --cwd ../planqtool
import yargs from 'yargs'

// tslint:disable-next-line: no-unused-expression
yargs
  .scriptName('planqtooljs')
  .option('verbose', {
    type: 'boolean',
    description:
      'Whether to show a bunch of debugging output like stdout and stderr of shell commands',
    default: false,
  })
  .option('yesreally', {
    type: 'boolean',
    description: 'Reply "yes" to prompts about changing staging/production (be careful!)',
    default: false,
  })
  .option('helmdryrun', {
    type: 'boolean',
    description: 'Simulate the Helm deployment. Other deployment operations can be executed',
    default: false,
  })
  .middleware([
    (argv: any) => {
      process.env.PLQTOOL_VERBOSE = argv.verbose
      process.env.PLQTOOL_CONFIRMED = argv.yesreally
      process.env.PLQTOOL_HELM_DRY_RUN = argv.helmdryrun
    },
  ])
  .commandDir('cmds', { extensions: ['ts'] })
  .demandCommand()
  .help()
  .wrap(yargs.terminalWidth()).argv
