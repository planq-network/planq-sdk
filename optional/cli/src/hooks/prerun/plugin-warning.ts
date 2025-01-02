import { Hook } from '@oclif/config'
import { CLIError } from '@oclif/errors'
import prompts from 'prompts'

const hook: Hook<'prerun'> = async (opts) => {
  if (['plugins:install', 'plugins:link'].includes(opts.Command.id || '')) {
    // Require @planq-network/* NPM scope for any package installation
    // If no args are passed in, default to oclif/plugin-plugins error handling
    if (opts.argv.length && !/(@planq-network\/.+)/.test(opts.argv[0])) {
      throw new CLIError(
        'Only plugins published in the @planq-network/* and @clabs/* NPM scopes may currently be installed.'
      )
    }
    // Ask for explicit confirmation to install any plugins
    const response = await prompts({
      type: 'confirm',
      name: 'confirmation',
      message: 'Are you sure you want to install this plugin? (y/n)',
    })

    if (!response.confirmation) {
      console.info('Aborting due to user response')
      process.exit(0)
    }
  }
}

export default hook
