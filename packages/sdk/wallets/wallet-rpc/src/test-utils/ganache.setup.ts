import { emptySetup } from '@planq-network/dev-utils/lib/ganache-setup'
import { waitForPortOpen } from '@planq-network/dev-utils/lib/network'

export default async function setup() {
  // tslint:disable:no-console
  console.log('\nstarting ganache...')
  await emptySetup({})
  await waitForPortOpen('localhost', 8545, 60)
  // tslint:disable:no-console
  console.log('...ganache started')
}
