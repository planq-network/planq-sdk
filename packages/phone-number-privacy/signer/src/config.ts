import {
  BlockchainConfig,
  DB_POOL_MAX_SIZE,
  DB_TIMEOUT,
  FULL_NODE_TIMEOUT_IN_MS,
  RETRY_COUNT,
  RETRY_DELAY_IN_MS,
  toBool,
} from "@planq-network/phone-number-privacy-common";
import BigNumber from "bignumber.js";

require("dotenv").config();

export function getSignerVersion(): string {
  return process.env.npm_package_version ?? "0.0.0";
}
export const DEV_MODE = process.env.NODE_ENV !== "production";
export const VERBOSE_DB_LOGGING = toBool(process.env.VERBOSE_DB_LOGGING, false);

export enum SupportedDatabase {
  Postgres = "postgres", // PostgresSQL
  MySql = "mysql", // MySQL
  MsSql = "mssql", // Microsoft SQL Server
  Sqlite = "sqlite3", // SQLite (for testing)
}

export enum SupportedKeystore {
  AZURE_KEY_VAULT = "AzureKeyVault",
  GOOGLE_SECRET_MANAGER = "GoogleSecretManager",
  AWS_SECRET_MANAGER = "AWSSecretManager",
  MOCK_SECRET_MANAGER = "MockSecretManager",
}

export interface SignerConfig {
  serviceName: string;
  server: {
    port: string | number | undefined;
    sslKeyPath?: string;
    sslCertPath?: string;
  };
  quota: {
    unverifiedQueryMax: number;
    additionalVerifiedQueryMax: number;
    queryPerTransaction: number;
    minDollarBalance: BigNumber;
    minEuroBalance: BigNumber;
    minPlanqBalance: BigNumber;
    queryPriceInAUSD: BigNumber;
  };
  api: {
    domains: {
      enabled: boolean;
    };
    phoneNumberPrivacy: {
      enabled: boolean;
    };
  };
  blockchain: BlockchainConfig;
  db: {
    type: SupportedDatabase;
    user: string;
    password: string;
    database: string;
    host: string;
    port?: number;
    ssl: boolean;
    poolMaxSize: number;
    timeout: number;
  };
  keystore: {
    type: SupportedKeystore;
    keys: {
      phoneNumberPrivacy: {
        name: string;
        latest: number;
      };
      domains: {
        name: string;
        latest: number;
      };
    };
    azure: {
      clientID: string;
      clientSecret: string;
      tenant: string;
      vaultName: string;
    };
    google: {
      projectId: string;
    };
    aws: {
      region: string;
      secretKey: string;
    };
  };
  timeout: number;
  test_quota_bypass_percentage: number;
  fullNodeTimeoutMs: number;
  fullNodeRetryCount: number;
  fullNodeRetryDelayMs: number;
  shouldMockAccountService: boolean;
  mockDek: string;
  mockTotalQuota: number;
  shouldMockRequestService: boolean;
  requestPrunningDays: number;
  requestPrunningAtServerStart: boolean;
  requestPrunningJobCronPattern: string;
}

const env = process.env as any;
export const config: SignerConfig = {
  serviceName: env.SERVICE_NAME ?? "odis-signer",
  server: {
    port: Number(env.SERVER_PORT ?? 8080),
    sslKeyPath: env.SERVER_SSL_KEY_PATH,
    sslCertPath: env.SERVER_SSL_CERT_PATH,
  },
  quota: {
    unverifiedQueryMax: Number(env.UNVERIFIED_QUERY_MAX ?? 10),
    additionalVerifiedQueryMax: Number(env.ADDITIONAL_VERIFIED_QUERY_MAX ?? 30),
    queryPerTransaction: Number(env.QUERY_PER_TRANSACTION ?? 2),
    // Min balance is .01 aUSD
    minDollarBalance: new BigNumber(env.MIN_DOLLAR_BALANCE ?? 1e16),
    // Min balance is .01 aEUR
    minEuroBalance: new BigNumber(env.MIN_DOLLAR_BALANCE ?? 1e16),
    // Min balance is .005 PLQ
    minPlanqBalance: new BigNumber(env.MIN_DOLLAR_BALANCE ?? 5e15),
    // Equivalent to 0.001 aUSD/query
    queryPriceInAUSD: new BigNumber(env.QUERY_PRICE_PER_AUSD ?? 0.001),
  },
  api: {
    domains: {
      enabled: toBool(env.DOMAINS_API_ENABLED, false),
    },
    phoneNumberPrivacy: {
      enabled: toBool(env.PHONE_NUMBER_PRIVACY_API_ENABLED, false),
    },
  },
  blockchain: {
    provider: env.BLOCKCHAIN_PROVIDER,
    apiKey: env.BLOCKCHAIN_API_KEY,
  },
  db: {
    type: env.DB_TYPE ? env.DB_TYPE.toLowerCase() : SupportedDatabase.Postgres,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    host: env.DB_HOST,
    port: env.DB_PORT ? Number(env.DB_PORT) : undefined,
    ssl: toBool(env.DB_USE_SSL, true),
    poolMaxSize: Number(env.DB_POOL_MAX_SIZE ?? DB_POOL_MAX_SIZE),
    timeout: Number(env.DB_TIMEOUT ?? DB_TIMEOUT),
  },
  keystore: {
    type: env.KEYSTORE_TYPE,
    keys: {
      phoneNumberPrivacy: {
        name: env.PHONE_NUMBER_PRIVACY_KEY_NAME_BASE,
        latest: Number(env.PHONE_NUMBER_PRIVACY_LATEST_KEY_VERSION ?? 1),
      },
      domains: {
        name: env.DOMAINS_KEY_NAME_BASE,
        latest: Number(env.DOMAINS_LATEST_KEY_VERSION ?? 1),
      },
    },
    azure: {
      clientID: env.KEYSTORE_AZURE_CLIENT_ID,
      clientSecret: env.KEYSTORE_AZURE_CLIENT_SECRET,
      tenant: env.KEYSTORE_AZURE_TENANT,
      vaultName: env.KEYSTORE_AZURE_VAULT_NAME,
    },
    google: {
      projectId: env.KEYSTORE_GOOGLE_PROJECT_ID,
    },
    aws: {
      region: env.KEYSTORE_AWS_REGION,
      secretKey: env.KEYSTORE_AWS_SECRET_KEY,
    },
  },
  timeout: Number(env.ODIS_SIGNER_TIMEOUT ?? 5000),
  test_quota_bypass_percentage: Number(env.TEST_QUOTA_BYPASS_PERCENTAGE ?? 0),
  fullNodeTimeoutMs: Number(env.TIMEOUT_MS ?? FULL_NODE_TIMEOUT_IN_MS),
  fullNodeRetryCount: Number(env.RETRY_COUNT ?? RETRY_COUNT),
  fullNodeRetryDelayMs: Number(env.RETRY_DELAY_IN_MS ?? RETRY_DELAY_IN_MS),
  shouldMockAccountService: toBool(env.SHOULD_MOCK_ACCOUNT_SERVICE, false),
  mockDek: env.MOCK_DEK,
  mockTotalQuota: Number(env.MOCK_TOTAL_QUOTA ?? 10),
  shouldMockRequestService: toBool(env.SHOULD_MOCK_REQUEST_SERVICE, false),
  requestPrunningDays: Number(env.REQUEST_PRUNNING_DAYS ?? 7),
  requestPrunningAtServerStart: toBool(
    env.REQUEST_PRUNNING_AT_SERVER_START,
    false
  ),
  requestPrunningJobCronPattern:
    env.REQUEST_PRUNNING_JOB_CRON_PATTERN ?? "0 0 3 * * *",
};
