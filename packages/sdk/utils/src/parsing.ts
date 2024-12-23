import BigNumber from 'bignumber.js'

// Exports moved to @planq-network/base, forwarding them
// here for backwards compatibility
export { parseSolidityStringArray, stringToBoolean } from '@planq-network/base/lib/parsing'

export const parseInputAmount = (inputString: string, decimalSeparator = '.'): BigNumber => {
  if (decimalSeparator !== '.') {
    inputString = inputString.replace(decimalSeparator, '.')
  }
  return new BigNumber(inputString || '0')
}
