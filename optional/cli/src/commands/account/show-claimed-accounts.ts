import { ContractKit, IdentityMetadataWrapper } from '@planq-network/contractkit'
import { ClaimTypes } from '@planq-network/contractkit/lib/identity'
import { AccountClaim } from '@planq-network/contractkit/lib/identity/claims/account'
import { verifyAccountClaim } from '@planq-network/contractkit/lib/identity/claims/verify'
import { ensureLeading0x } from '@planq-network/utils/lib/address'
import { notEmpty } from '@planq-network/utils/lib/collections'
import { BaseCommand } from '../../base'
import { printValueMap } from '../../utils/cli'
import { Args } from '../../utils/command'

async function getMetadata(kit: ContractKit, address: string) {
  const accounts = await kit.contracts.getAccounts()
  const url = await accounts.getMetadataURL(address)
  console.log(address, 'has url', url)
  if (url === '') return IdentityMetadataWrapper.fromEmpty(address)
  else return IdentityMetadataWrapper.fetchFromURL(accounts, url)
}

function dedup(lst: string[]): string[] {
  return [...new Set(lst)]
}

async function getClaims(
  kit: ContractKit,
  address: string,
  data: IdentityMetadataWrapper
): Promise<string[]> {
  const getClaim = async (claim: AccountClaim) => {
    const error = await verifyAccountClaim(kit, claim, ensureLeading0x(address))
    return error ? null : claim.address.toLowerCase()
  }
  const res = (await Promise.all(data.filterClaims(ClaimTypes.ACCOUNT).map(getClaim))).filter(
    notEmpty
  )
  res.push(address)
  return dedup(res)
}

export default class ShowClaimedAccounts extends BaseCommand {
  static description = 'Show information about claimed accounts'

  static flags = {
    ...BaseCommand.flags,
  }

  static args = [Args.address('address')]

  static examples = ['show-claimed-accounts 0x5409ed021d9299bf6814279a6a1411a7e866a631']

  async run() {
    const { args } = this.parse(ShowClaimedAccounts)

    const metadata = await getMetadata(this.kit, args.address)

    const claimedAccounts = await getClaims(this.kit, args.address, metadata)

    console.log('All balances expressed in units of 10^-18.')
    for (const address of claimedAccounts) {
      console.log('\nShowing balances for', address)
      const balance = await this.kit.getTotalBalance(address)
      printValueMap(balance)
    }
  }
}
