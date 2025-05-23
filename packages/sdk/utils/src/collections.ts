import * as base from '@planq-network/base/lib/collections'
import BigNumber from 'bignumber.js'

// Exports moved to @planq-network/base, forwarding them
// here for backwards compatibility
export { intersection, notEmpty, zeroRange, zip, zip3 } from '@planq-network/base/lib/collections'
export type AddressListItem = base.AddressListItem<BigNumber>

// BigNumber comparator
const bigNumberComparator: base.Comparator<BigNumber> = (a: BigNumber, b: BigNumber) => a.lt(b)

export function linkedListChange(
  sortedList: AddressListItem[],
  change: AddressListItem
): { lesser: string; greater: string; list: AddressListItem[] } {
  return base.linkedListChange(sortedList, change, bigNumberComparator)
}

export function linkedListChanges(
  sortedList: AddressListItem[],
  changeList: AddressListItem[]
): { lessers: string[]; greaters: string[]; list: AddressListItem[] } {
  return base.linkedListChanges(sortedList, changeList, bigNumberComparator)
}
