import teardown from '@planq-network/dev-utils/lib/ganache-teardown'

export default async function globalTeardown() {
  await teardown()
}
