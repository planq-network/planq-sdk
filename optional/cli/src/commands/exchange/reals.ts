import { StableToken } from '@planq-network/contractkit'
import ExchangeStableBase from '../../exchange-stable-base'
import { Flags } from '../../utils/command'
export default class ExchangeEuros extends ExchangeStableBase {
  static description = 'Exchange Planq Brazilian Real (pREAL) for PLQ via the stability mechanism'

  static flags = {
    ...ExchangeStableBase.flags,
    from: Flags.address({
      required: true,
      description: 'The address with Planq Brazilian Real to exchange',
    }),
    value: Flags.wei({
      required: true,
      description: 'The value of Planq Brazilian Real to exchange for PLQ',
    }),
  }

  static examples = [
    'reals --value 10000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d',
    'reals --value 10000000000000 --forAtLeast 50000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d',
  ]

  async init() {
    this._stableCurrency = StableToken.pREAL
    await super.init()
  }
}
