import chalk from 'chalk'
import fs = require('fs')
import {
  ReleasePlanqContract,
  ReleasePlanqMultiSigContract,
  ReleasePlanqMultiSigProxyContract,
  ReleasePlanqProxyContract,
} from 'types'

let argv: any
let contracts: any
let configs: any
let ReleasePlanq: ReleasePlanqContract
let ReleasePlanqProxy: ReleasePlanqProxyContract
let ReleasePlanqMultiSig: ReleasePlanqMultiSigContract
let ReleasePlanqMultiSigProxy: ReleasePlanqMultiSigProxyContract
// const ONE_CGLD = web3.utils.toWei('1', 'ether')

async function verifyContract(contract: any, config: any) {
  let verified = true
  // Balance check should only be used immediately after contract deployments.
  // Otherwise, balances may increase via rewards, or decrease via withdrawals, leading to false negatives.
  // verified = verified && (await verifyBalance(contract.ContractAddress, config))
  verified = verified && (await verifyMultisig(contract.MultiSigProxyAddress, config))
  verified =
    verified &&
    (await verifyReleasePlanq(contract.ContractAddress, contract.MultiSigProxyAddress, config))
  return verified
}

async function verifyMultisig(multiSigAddress: any, config: any) {
  const releasePlanqMultiSig = await ReleasePlanqMultiSig.at(multiSigAddress)
  let contractOwners = await releasePlanqMultiSig.getOwners()
  let configOwners = [config.beneficiary, config.releaseOwner]
  contractOwners = contractOwners.map((x) => x.toLowerCase())
  configOwners = configOwners.map((x) => x.toLowerCase())
  for (let i = 0; i < contractOwners.length; i++) {
    if (contractOwners.indexOf(configOwners[i]) === -1) {
      console.info(
        chalk.red(
          "Multisig contracts' owners are not properly set to `beneficiary` and `releaseOwner`. This is possible (if the user elected to change their beneficiary) but uncommon."
        )
      )
      return false
    }
  }
  const releasePlanqMultiSigProxy = await ReleasePlanqMultiSigProxy.at(multiSigAddress)
  if (
    (await releasePlanqMultiSigProxy._getOwner()).toLowerCase() !== multiSigAddress.toLowerCase()
  ) {
    console.info(chalk.red('ReleasePlanqMultiSigProxy is not properly set.'))
    return false
  }
  return true
}

async function verifyReleasePlanq(releasePlanqAddress: any, multiSigAddress: any, config: any) {
  const releasePlanq = await ReleasePlanq.at(releasePlanqAddress)
  const releasePlanqProxy = await ReleasePlanqProxy.at(releasePlanqAddress)
  if ((await releasePlanq.owner()).toLowerCase() !== multiSigAddress.toLowerCase()) {
    console.info(chalk.red('ReleasePlanq owner not properly set.'))
    return false
  }
  if ((await releasePlanqProxy._getOwner()).toLowerCase() !== multiSigAddress.toLowerCase()) {
    console.info(chalk.red('ReleasePlanqProxy owner not properly set'))
    return false
  }
  if ((await releasePlanq.beneficiary()).toLowerCase() !== config.beneficiary.toLowerCase()) {
    console.info(chalk.red('Beneficiary from config does not match contract'))
    return false
  }
  return true
}

// Uncomment if using `verifyBalance` just after contract deployment.
// async function verifyBalance(contractAddress: any, releasePlanqConfig: any) {
//   const contractBalance = new BigNumber(await web3.eth.getBalance(contractAddress))
//   const weiAmountReleasedPerPeriod = new BigNumber(
//     web3.utils.toWei(releasePlanqConfig.amountReleasedPerPeriod.toString())
//   )
//   let configValue = weiAmountReleasedPerPeriod.multipliedBy(releasePlanqConfig.numReleasePeriods)
//   const adjustedAmountPerPeriod = configValue
//     .minus(ONE_CGLD)
//     .div(releasePlanqConfig.numReleasePeriods)
//     .dp(0)

//   // Reflect any rounding changes from the division above
//   configValue = adjustedAmountPerPeriod.multipliedBy(releasePlanqConfig.numReleasePeriods)
//   if (!contractBalance.eq(configValue)) {
//     console.info(chalk.yellow("Contract balance does not match configured amount. This is likely because of the balance increasing from rewards or users sending more PLQ, please verify:\nConfigured amount:" + configValue.toFixed() + ", Contract Balance:" + contractBalance.toFixed()))
//     return false
//   }
//   return true
// }

function findConfigByID(identifier) {
  for (const config of configs) {
    if (config.identifier === identifier) {
      return config
    }
  }
  return null
}

module.exports = async (callback: (error?: any) => number) => {
  try {
    argv = require('minimist')(process.argv.slice(3), {
      string: ['network', 'contracts_file', 'config_file'],
    })
    try {
      contracts = JSON.parse(fs.readFileSync(argv.contract_json, 'utf-8'))
      configs = JSON.parse(fs.readFileSync(argv.config_json, 'utf-8'))
    } catch (e) {
      console.info('Fail - bad file given, error: ' + e)
      process.exit(0)
    }
    if (contracts.length !== configs.length) {
      console.info('Lengths do not match, exiting')
      process.exit(0)
    }
    const failures = []
    ReleasePlanq = artifacts.require('ReleasePlanq')
    ReleasePlanqProxy = artifacts.require('ReleasePlanqProxy')
    ReleasePlanqMultiSig = artifacts.require('ReleasePlanqMultiSig')
    ReleasePlanqMultiSigProxy = artifacts.require('ReleasePlanqMultiSigProxy')
    for (const contract of contracts) {
      const config = findConfigByID(contract.Identifier)
      if (config === null) {
        console.info(
          'Identifier: ' + contract.Identifier + ' from contracts file not found in configs file.'
        )
        process.exit(0)
      }
      if (!(await verifyContract(contract, config))) {
        console.info(
          chalk.red(
            'MISMATCH: Contract with identifier ' + contract.Identifier + ' is not verified.'
          )
        )
        failures.push(contract.Identifier)
      }
    }
    if (failures.length > 0) {
      console.info(
        failures.length +
          ' mismatches were identified, please review the output identifiers above.\nOutputting failures to `failureOutput.json`.'
      )
      fs.writeFileSync('failureOutput.json', JSON.stringify(failures, null, 2))
    }
  } catch (error) {
    callback(error)
  }
}
