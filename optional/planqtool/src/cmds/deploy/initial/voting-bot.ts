import { InitialArgv } from 'src/cmds/deploy/initial'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import { isPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { ensure0x } from 'src/lib/utils'
import { installHelmChart, setupVotingBotAccounts } from 'src/lib/voting-bot'
import yargs from 'yargs'

export const command = 'voting-bot'
export const describe = 'deploy voting-bot'

interface VotingBotArgv extends InitialArgv {
  excludedGroups?: string[]
}

export const builder = (argv: yargs.Argv) => {
  return argv.option('excludedGroups', {
    type: 'string',
    description: 'Addresses of Validator Group(s) that the bot should not vote for.',
    coerce: (addresses) => {
      return addresses.split(',').map(ensure0x)
    },
  })
}

export const handler = async (argv: VotingBotArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)
  if (!isPlanqtoolHelmDryRun()) {
    await setupVotingBotAccounts(argv.planqEnv)
  }
  await installHelmChart(argv.planqEnv, argv.excludedGroups)
}
