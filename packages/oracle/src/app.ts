import { BaseReporter, BaseReporterConfig } from './reporters/base'
import { BlockBasedReporter, BlockBasedReporterConfig } from './reporters/block_based_reporter'
import { MetricCollector } from './metric_collector'
import { DataAggregator, DataAggregatorConfig } from './data_aggregator'
import { ContractKit, newKit } from '@planq-network/contractkit'
import { ReportTarget } from '@planq-network/contractkit/lib/wrappers/SortedOracles'
import {
  Exchange,
  OracleCurrencyPair,
  ReportStrategy,
  WalletType,
  reportTargetForCurrencyPair,
  requireVariables,
  ensureLeading0x,
  isValidPrivateKey,
} from './utils'

import Logger from 'bunyan'
import fs from 'fs'

/**
 * Omit the fields that are passed in by the Application
 */
type DataAggregatorConfigToOmit = 'metricCollector' | 'currencyPair' | 'apiKeys'
export type DataAggregatorConfigSubset = Omit<DataAggregatorConfig, DataAggregatorConfigToOmit>
type ReporterConfigToOmit =
  | 'dataAggregator'
  | 'kit'
  | 'metricCollector'
  | 'oracleAccount'
  | 'currencyPair'
  | 'reportTarget'
export type BaseReporterConfigSubset = Omit<BaseReporterConfig, ReporterConfigToOmit>
export type BlockBasedReporterConfigSubset = Omit<
  BlockBasedReporterConfig,
  ReporterConfigToOmit | 'wsRpcProviderUrl'
>
export type TransactionManagerConfig = Pick<
  BaseReporterConfig,
  | 'gasPriceMultiplier'
  | 'oracleAccount'
  | 'transactionRetryGasPriceMultiplier'
  | 'transactionRetryLimit'
  | 'metricCollector'
> & {
  logger?: Logger
}

/**
 * This specifies configurations to the OracleApplication
 */
export interface OracleApplicationConfig {
  /**
   * The address this oracle will send transactions from.
   * Only needed when using HSM signing in Azure. If using `privateKeyPath`,
   * this is ignored and the address is derived from the private key
   */
  address?: string
  /**
   * A set of available API keys per exchange (for those that require one)
   */
  apiKeys: Partial<Record<Exchange, string>>
  /**
   * The name in code form of the AWS region the key is located in.
   * Only used if walletType is AWS_HSM.
   * eg: eu-central-1
   */
  awsKeyRegion: string
  /**
   * The name of an Azure Key Vault where an HSM with the address `address` exists.
   * Has higher precedence over `privateKeyPath`.
   */
  azureKeyVaultName?: string
  /**
   * The number of times to try initializing the AzureHSMWallet if the previous
   * init was unsuccessful.
   */
  azureHsmInitTryCount?: number
  /**
   * The max backoff in ms between AzureHSMWallet init retries.
   */
  azureHsmInitMaxRetryBackoffMs?: number
  /**
   * A base instance of the logger that can be extended for a particular context
   */
  baseLogger: Logger
  /** The currency pair that this oracle is reporting upon */
  currencyPair: OracleCurrencyPair
  /** Configuration for the Data Aggregator */
  dataAggregatorConfig: DataAggregatorConfigSubset
  /**
   * If the oracles should be in development mode, which doesn't require a node nor account key
   */
  devMode: boolean
  /** The http URL of a web3 provider to send RPCs to */
  httpRpcProviderUrl: string
  /**
   * Controls whether to report metrics for this app instance
   */
  metrics: boolean
  /**
   * The path to a file where the private key for tx signing is stored.
   * The account address is derived from this private key.
   * If `azureKeyVaultName` is specified, this is ignored.
   */
  privateKeyPath?: string
  /**
   * If collecting metrics, specify the port for Prometheus
   */
  prometheusPort?: number
  /**
   * Configuration specific to the Reporter. Includes things like overrides to
   * the default reporting schedule,
   */
  reporterConfig: BlockBasedReporterConfigSubset
  /**
   * The report strategy
   */
  reportStrategy: ReportStrategy
  /* To override the default identifier when reporting to chain */
  reportTargetOverride: ReportTarget | undefined
  /** The type of wallet to use for signing transaction */
  walletType: WalletType
  /** The websocket URL of a web3 provider to listen to events through with block-based reporting */
  wsRpcProviderUrl: string
  mockAccount: string
}

export class OracleApplication {
  private initialized: boolean
  private readonly config: OracleApplicationConfig

  private _dataAggregator: DataAggregator
  private _reporter: BaseReporter | undefined

  private readonly logger: Logger
  readonly metricCollector: MetricCollector | undefined

  /**
   * @param config configuration values for the oracle application
   */
  constructor(config: OracleApplicationConfig) {
    this.config = config

    if (this.config.metrics) {
      const { prometheusPort } = this.config
      requireVariables({ prometheusPort })
      this.metricCollector = new MetricCollector(this.config.baseLogger)
      this.metricCollector.startServer(prometheusPort!)
    }
    this._dataAggregator = new DataAggregator({
      ...config.dataAggregatorConfig,
      apiKeys: this.config.apiKeys,
      currencyPair: this.config.currencyPair,
      metricCollector: this.metricCollector,
    })
    this.logger = this.config.baseLogger.child({ context: 'app' })
    this.logger.info(
      {
        config: this.prettyConfig(),
      },
      'Created app'
    )
    this.initialized = false
  }

  async init() {
    this.requireUninitialized()

    const { httpRpcProviderUrl, privateKeyPath, currencyPair, walletType, wsRpcProviderUrl } =
      this.config
    let kit: ContractKit

    this.logger.info(
      {
        address: this.config.address,
        privateKeyPath,
      },
      'Initializing app'
    )

    switch (this.config.walletType) {
      case WalletType.PRIVATE_KEY:
        kit = newKit(httpRpcProviderUrl)
        if (!this.config.devMode) {
          const privateKey = this.getPrivateKeyFromPath(privateKeyPath!)
          kit.addAccount(privateKey)
          this.config.address = kit.getWallet()!.getAccounts()[0]
        } else {
          this.config.address = this.config.mockAccount
          this.logger.info(`DEVMODE enabled, used mock address ${this.config.mockAccount}`)
        }
        break
      case WalletType.NODE_ACCOUNT:
        kit = newKit(httpRpcProviderUrl)
        if (this.config.address) {
          kit.defaultAccount = ensureLeading0x(this.config.address)
        } else {
          // If not default address, use the first one of the account
          const account = (await kit.web3.eth.getAccounts())[0]
          kit.defaultAccount = ensureLeading0x(account)
          this.config.address = account
        }
        break
      default:
        throw Error(`Invalid wallet type: ${walletType}`)
    }

    this.logger.info(`Using address ${this.config.address}`)

    const commonReporterConfig = {
      baseLogger: this.config.baseLogger,
      dataAggregator: this.dataAggregator,
      kit,
      metricCollector: this.metricCollector,
      oracleAccount: this.config.address!,
      reportTarget: this.config.reportTargetOverride
        ? this.config.reportTargetOverride
        : await reportTargetForCurrencyPair(this.config.currencyPair),
      currencyPair,
    }

    switch (this.config.reportStrategy) {
      case ReportStrategy.BLOCK_BASED:
        this._reporter = new BlockBasedReporter({
          ...(this.config.reporterConfig as BlockBasedReporterConfigSubset),
          ...commonReporterConfig,
          wsRpcProviderUrl,
        })
        break
      default:
        throw Error(`Invalid report strategy: ${this.config.reportStrategy}`)
    }

    await this._reporter.init()

    this.initialized = true
    this.logger.info('App initialized successfuly')
  }

  start(): void {
    this.requireInitialized()
    this.reporter.start()
  }

  stop(): void {
    this.reporter.stop()
  }

  get reporter(): BaseReporter {
    this.requireInitialized()

    return this._reporter!
  }

  get dataAggregator(): DataAggregator {
    return this._dataAggregator
  }

  getPrivateKeyFromPath(privateKeyPath: string): string {
    if (fs.existsSync(privateKeyPath)) {
      const privateKey = fs.readFileSync(privateKeyPath).toString()
      if (!this.validPrivateKey(privateKey)) {
        throw Error(`Invalid private key: ${privateKey}.`)
      }
      return privateKey
    }
    throw Error(`no file found at privateKeyPath: ${this.config.privateKeyPath}`)
  }

  validPrivateKey(privateKey: string): boolean {
    return isValidPrivateKey(ensureLeading0x(privateKey))
  }

  private requireInitialized() {
    if (!this.initialized) {
      throw Error(`App is not initialized`)
    }
  }

  private requireUninitialized() {
    if (this.initialized) {
      throw Error(`App is initialized`)
    }
  }

  /**
   * prettyConfig gives the config that is fit for logging to prevent unnecessarily
   * logging the `baseLogger` instances in the OracleApplicationConfig, DataAggregatorConfig,
   * and BaseReporterConfig
   */
  private prettyConfig(): OracleApplicationConfig {
    const removeBaseLogger = (config: any) => ({
      ...config,
      baseLogger: undefined,
    })
    return removeBaseLogger({
      ...this.config,
      dataAggregatorConfig: removeBaseLogger(this.config.dataAggregatorConfig),
      reporterConfig: removeBaseLogger(this.config.reporterConfig),
    })
  }
}
