import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class Withdraw extends ReleasePlanqBaseCommand {
  static description =
    'Withdraws `value` released planq to the beneficiary address. Fails if `value` worth of planq has not been released yet.'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    value: Flags.wei({
      required: true,
      description: 'Amount of released planq (in wei) to withdraw',
    }),
  }

  static args = []

  static examples = [
    'withdraw --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --value 10000000000000000000000',
  ]

  async run() {
    // tslint:disable-next-line
    const { flags } = this.parse(Withdraw)
    const value = flags.value

    const remainingUnlockedBalance = await this.releasePlanqWrapper.getRemainingUnlockedBalance()
    const maxDistribution = await this.releasePlanqWrapper.getMaxDistribution()
    const totalWithdrawn = await this.releasePlanqWrapper.getTotalWithdrawn()
    await newCheckBuilder(this)
      .addCheck('Value does not exceed available unlocked planq', () =>
        value.lte(remainingUnlockedBalance)
      )
      .addCheck('Value would not exceed maximum distribution', () =>
        value.plus(totalWithdrawn).lte(maxDistribution)
      )
      .addCheck('Contract has met liquidity provision if applicable', () =>
        this.releasePlanqWrapper.getLiquidityProvisionMet()
      )
      .addCheck(
        'Contract would self-destruct with pUSD left when withdrawing the whole balance',
        async () => {
          if (value.eq(remainingUnlockedBalance)) {
            const stableToken = await this.kit.contracts.getStableToken()
            const stableBalance = await stableToken.balanceOf(this.releasePlanqWrapper.address)
            if (stableBalance.gt(0)) {
              return false
            }
          }

          return true
        }
      )
      .runChecks()

    this.kit.defaultAccount = await this.releasePlanqWrapper.getBeneficiary()
    await displaySendTx('withdrawTx', this.releasePlanqWrapper.withdraw(value))
  }
}
