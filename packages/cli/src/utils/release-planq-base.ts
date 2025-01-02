import { newReleasePlanq } from '@planq-network/contractkit/lib/generated/ReleasePlanq'
import { ReleasePlanqWrapper } from '@planq-network/contractkit/lib/wrappers/ReleasePlanq'
import { ParserOutput } from '@oclif/parser/lib/parse'
import { BaseCommand } from '../base'
import { Flags } from './command'

export abstract class ReleasePlanqBaseCommand extends BaseCommand {
  static flags = {
    ...BaseCommand.flags,
    contract: Flags.address({ required: true, description: 'Address of the ReleasePlanq Contract' }),
  }

  private _contractAddress: string | null = null
  private _releasePlanqWrapper: ReleasePlanqWrapper | null = null

  get contractAddress() {
    if (!this._contractAddress) {
      const res: ParserOutput<any, any> = this.parse()
      this._contractAddress = String(res.flags.contract)
    }
    return this._contractAddress
  }

  get releasePlanqWrapper() {
    if (!this._releasePlanqWrapper) {
      this.error('Error in initilizing release planq wrapper')
    }
    return this._releasePlanqWrapper
  }

  async init() {
    await super.init()
    if (!this._releasePlanqWrapper) {
      this._releasePlanqWrapper = new ReleasePlanqWrapper(
        this.kit.connection,
        newReleasePlanq(this.kit.connection.web3, this.contractAddress as string),
        this.kit.contracts
      )
      // Call arbitrary release planq fn to verify `contractAddress` is a releaseplanq contract.
      try {
        await this._releasePlanqWrapper.getBeneficiary()
      } catch (err) {
        this.error(`Does the provided address point to release planq contract? ${err}`)
      }
    }
  }
}
