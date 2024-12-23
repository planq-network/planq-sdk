import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { getFornoUrl } from 'src/lib/endpoints'
import { envVar, fetchEnv } from 'src/lib/env-utils'
import { AccountType, getPrivateKeysFor } from 'src/lib/generate_utils'
import { installGenericHelmChart, removeGenericHelmChart } from 'src/lib/helm_deploy'
import { ensure0x } from 'src/lib/utils'
import Web3 from 'web3'

const web3 = new Web3()

const helmChartPath = '../helm-charts/voting-bot'

export async function installHelmChart(planqEnv: string, excludedGroups?: string[]) {
  const params = await helmParameters(planqEnv, excludedGroups)
  console.info(params)
  return installGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir: helmChartPath,
    parameters: params,
  })
}
export async function removeHelmRelease(planqEnv: string) {
  await removeGenericHelmChart(releaseName(planqEnv), planqEnv)
}

export async function setupVotingBotAccounts(planqEnv: string) {
  const fornoUrl = getFornoUrl(planqEnv)
  const mnemonic = fetchEnv(envVar.MNEMONIC)
  const numBotAccounts = parseInt(fetchEnv(envVar.VOTING_BOTS), 10)

  const kit: ContractKit = newKitFromWeb3(new Web3(fornoUrl))
  const planqToken = await kit.contracts.getPlanqToken()
  const lockedPlanq = await kit.contracts.getLockedPlanq()
  const accounts = await kit.contracts.getAccounts()

  const botsWithoutPlanq: string[] = []

  for (const key of getPrivateKeysFor(AccountType.VOTING_BOT, mnemonic, numBotAccounts)) {
    const botAccount = ensure0x(web3.eth.accounts.privateKeyToAccount(key).address)
    const planqBalance = await planqToken.balanceOf(botAccount)
    if (planqBalance.isZero()) {
      botsWithoutPlanq.push(botAccount)
      continue
    }

    kit.connection.addAccount(key)

    if (!(await accounts.isAccount(botAccount))) {
      const registerTx = await accounts.createAccount()
      await registerTx.sendAndWaitForReceipt({ from: botAccount })
    }

    const amountLocked = await lockedPlanq.getAccountTotalLockedPlanq(botAccount)
    if (amountLocked.isZero()) {
      const tx = await lockedPlanq.lock()
      const amountToLock = planqBalance.multipliedBy(0.99).toFixed(0)

      await tx.sendAndWaitForReceipt({
        to: lockedPlanq.address,
        value: amountToLock,
        from: botAccount,
      })
      console.info(`Locked planq for ${botAccount}`)
    }
  }
  if (botsWithoutPlanq.length > 0) {
    throw new Error(`These bot accounts have no planq. Faucet them, and retry: ${botsWithoutPlanq}`)
  }
  console.info('Finished/confirmed setup of voting bot accounts')

  kit.connection.stop()
}

function helmParameters(planqEnv: string, excludedGroups?: string[]) {
  const params = [
    `--set planqProvider=${getFornoUrl(planqEnv)}`,
    `--set cronSchedule="${fetchEnv(envVar.VOTING_BOT_CRON_SCHEDULE)}"`,
    `--set domain.name=${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}`,
    `--set environment=${planqEnv}`,
    `--set imageRepository=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_REPOSITORY)}`,
    `--set imageTag=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_TAG)}`,
    `--set mnemonic="${fetchEnv(envVar.MNEMONIC)}"`,
    `--set votingBot.changeBaseline="${fetchEnv(envVar.VOTING_BOT_CHANGE_BASELINE)}"`,
    `--set votingBot.count=${fetchEnv(envVar.VOTING_BOTS)}`,
    `--set votingBot.exploreProbability="${fetchEnv(envVar.VOTING_BOT_EXPLORE_PROBABILITY)}"`,
    `--set votingBot.scoreSensitivity="${fetchEnv(envVar.VOTING_BOT_SCORE_SENSITIVITY)}"`,
    `--set votingBot.wakeProbability="${fetchEnv(envVar.VOTING_BOT_WAKE_PROBABILITY)}"`,
  ]

  if (excludedGroups && excludedGroups.length > 0) {
    params.push(`--set votingBot.excludedGroups="${excludedGroups.join('\\,')}"`)
  }
  return params
}

function releaseName(planqEnv: string) {
  return `${planqEnv}-voting-bot`
}
