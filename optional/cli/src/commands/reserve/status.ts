import { BaseCommand } from '../../base'
import { printValueMapRecursive } from '../../utils/cli'

export default class ReserveStatus extends BaseCommand {
  static description = 'Shows information about reserve'

  static flags = {
    ...BaseCommand.flags,
  }

  static examples = ['status']

  async run() {
    const reserve = await this.kit.contracts.getReserve()
    const data = {
      'Reserve address': reserve.address,
      Spenders: await reserve.getSpenders(),
      'Other reserves': await reserve.getOtherReserveAddresses(),
      Frozen: await reserve.frozenReservePlanqStartBalance(),
      'Planq balance': await reserve.getReservePlanqBalance(),
    }
    printValueMapRecursive(data)
  }
}
