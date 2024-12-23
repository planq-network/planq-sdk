import { eqAddress } from '@planq-network/utils/lib/address'
import { flags } from '@oclif/command'
import BigNumber from 'bignumber.js'
import { newCheckBuilder } from '../../utils/checks'
import { binaryPrompt, displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class LockedPlanq extends ReleasePlanqBaseCommand {
  static description =
    'Perform actions [lock, unlock, withdraw] on PLQ that has been locked via the provided ReleasePlanq contract.'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    action: flags.string({
      char: 'a',
      options: ['lock', 'unlock', 'withdraw'],
      description: "Action to perform on contract's planq",
      required: true,
    }),
    value: Flags.wei({ required: true, description: 'Amount of planq to perform `action` with' }),
    yes: flags.boolean({ description: 'Answer yes to prompt' }),
  }

  static examples = [
    'locked-planq --contract 0xCcc8a47BE435F1590809337BB14081b256Ae26A8 --action lock --value 10000000000000000000000',
    'locked-planq --contract 0xCcc8a47BE435F1590809337BB14081b256Ae26A8 --action unlock --value 10000000000000000000000',
    'locked-planq --contract 0xCcc8a47BE435F1590809337BB14081b256Ae26A8 --action withdraw --value 10000000000000000000000',
  ]

  async run() {
    // tslint:disable-next-line
    const { flags } = this.parse(LockedPlanq)
    const value = new BigNumber(flags.value)
    const checkBuilder = newCheckBuilder(this, this.contractAddress).isAccount(this.contractAddress)
    const isRevoked = await this.releasePlanqWrapper.isRevoked()
    const beneficiary = await this.releasePlanqWrapper.getBeneficiary()
    const releaseOwner = await this.releasePlanqWrapper.getReleaseOwner()
    const lockedPlanq = await this.kit.contracts.getLockedPlanq()
    this.kit.defaultAccount = isRevoked ? releaseOwner : beneficiary

    if (flags.action === 'lock') {
      // Must verify contract is account before checking pending withdrawals
      await checkBuilder.addCheck('Is not revoked', () => !isRevoked).runChecks()
      const pendingWithdrawalsValue = await lockedPlanq.getPendingWithdrawalsTotalValue(
        this.contractAddress
      )
      const relockValue = BigNumber.minimum(pendingWithdrawalsValue, value)
      const lockValue = value.minus(relockValue)
      await newCheckBuilder(this, this.contractAddress)
        .hasEnoughPlanq(this.contractAddress, lockValue)
        .runChecks()
      const txos = await this.releasePlanqWrapper.relockPlanq(relockValue)
      for (const txo of txos) {
        await displaySendTx('lockedPlanqRelock', txo, { from: beneficiary })
      }
      if (lockValue.gt(new BigNumber(0))) {
        const accounts = await this.kit.contracts.getAccounts()
        const totalValue = await this.releasePlanqWrapper.getRemainingUnlockedBalance()
        const remaining = totalValue.minus(lockValue)
        console.log('remaining', remaining.toFixed())
        if (
          !flags.yes &&
          remaining.lt(new BigNumber(2e18)) &&
          (eqAddress(await accounts.getVoteSigner(flags.contract), flags.contract) ||
            eqAddress(await accounts.getValidatorSigner(flags.contract), flags.contract))
        ) {
          const check = await binaryPrompt(
            `Only ${remaining.shiftedBy(
              -18
            )} PLQ would be left unlocked, you might not be able to fund your signers. Unlock anyway?`,
            true
          )
          if (!check) {
            console.log('Cancelled')
            return
          }
        }
        await displaySendTx('lockedPlanqLock', this.releasePlanqWrapper.lockPlanq(lockValue))
      }
    } else if (flags.action === 'unlock') {
      await checkBuilder
        .isNotVoting(this.contractAddress)
        .hasEnoughLockedPlanqToUnlock(value)
        .runChecks()
      await displaySendTx('lockedPlanqUnlock', this.releasePlanqWrapper.unlockPlanq(flags.value))
    } else if (flags.action === 'withdraw') {
      await checkBuilder.runChecks()
      const currentTime = Math.round(new Date().getTime() / 1000)
      while (true) {
        let madeWithdrawal = false
        const pendingWithdrawals = await lockedPlanq.getPendingWithdrawals(this.contractAddress)
        for (let i = 0; i < pendingWithdrawals.length; i++) {
          const pendingWithdrawal = pendingWithdrawals[i]
          if (pendingWithdrawal.time.isLessThan(currentTime)) {
            console.log(
              `Found available pending withdrawal of value ${pendingWithdrawal.value.toFixed()}, withdrawing`
            )
            await displaySendTx('lockedPlanqWithdraw', this.releasePlanqWrapper.withdrawLockedPlanq(i))
            madeWithdrawal = true
            break
          }
        }
        if (!madeWithdrawal) break
      }
      const remainingPendingWithdrawals = await lockedPlanq.getPendingWithdrawals(
        this.contractAddress
      )
      for (const pendingWithdrawal of remainingPendingWithdrawals) {
        console.log(
          `Pending withdrawal of value ${pendingWithdrawal.value.toFixed()} available for withdrawal in ${pendingWithdrawal.time
            .minus(currentTime)
            .toFixed()} seconds.`
        )
      }
    }
  }
}
