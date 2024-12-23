import { recoverFunds } from '../../lib/recover-funds'

module.exports = async (callback: (error?: any) => number) => {
  const argv = require('minimist')(process.argv.slice(5), {
    string: ['release_planq', 'from'],
  })

  await recoverFunds(argv.release_planq, argv.from)
  console.info('  Funds recovered successfully!')
  callback()
}
