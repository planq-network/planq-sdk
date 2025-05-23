# ODIS - Signer Service

A service that generates unique partial signatures for blinded messages. Using a threshold BLS signature scheme, when K/N signatures are combined, a deterministic signature is obtained.

## APIs (ODIS v2)

ODIS v2 provides support for three APIs, which need to be explicitly enabled ([see below](#enabling-apis-odis-v2) for configuration info):

- **PNP API**: retrieve signatures for blinded messages, rate-limited based on quota purchased on-chain in `OdisPayments.sol`.
- **Domains API**: retrieve signatures over domains with custom rate-limiting schemes, as defined in more detail in [CIP-40](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0040.md).

## Configuration

You can use the following environment variables to configure the ODIS Signer service:

### Server

- `NODE_ENV` - `development` or `production`
- `SERVER_PORT` - The port on which the express node app runs (8080 by default).
- `SERVER_SSL_KEY_PATH` - (Optional) Path to SSL .key file.
- `SERVER_SSL_CERT_PATH` - (Optional) Path to SSL .cert file.

### Enabling APIs (ODIS v2)

Each API must be explicitly enabled by setting the following env vars to true (all are false by default):

- `PHONE_NUMBER_PRIVACY_API_ENABLED`
- `DOMAINS_API_ENABLED`

### Database

The service currently supports Postgres, MSSQL, and MySQL.

- `DB_TYPE` - `postgres`, `mysql`, or `mssql` (postgres by default).
- `DB_HOST` - The URL under which your database is accessible.
- `DB_PORT` - The port on the database host (uses default for chosen DB type).
- `DB_USERNAME` - DB configuration: The DB username (postgres by default).
- `DB_PASSWORD` - DB configuration: The DB password.
- `DB_DATABASE` - DB configuration: The DB database name (phoneNumberPrivacy by default).
- `DB_USE_SSL` - DB configuration: Use SSL connection to the database (true by default).

#### DB Migrations

To update the signer DB schema, first run `yarn db:migrate:make <migration_name>` to create a new migrations file. Then, fill in the new migration file as needed using the previous migration files as references.

Migrations will run automatically on startup.

### Blockchain provider

The service needs a connection to a full node in order to access chain state. The `BLOCKCHAIN_PROVIDER` config should be a url to a node with its JSON RPC enabled.
This could be a node with RPC set up. Preferably this would be an node dedicated to this service. Alternatively, the public Forno endpoints can be used but their uptime guarantees are not as strong. For development with Atlas, the forno url is `https://evm-atlas.planq.network`. For Mainnet, it would be `https://forno.celo.org`

- `BLOCKCHAIN_PROVIDER` - The blockchain node provider for chain state access. `
- `BLOCKCHAIN_API_KEY` - Optional API key to be added to the authentication header. `

### Security

The ODIS Signer service provides partial signatures that can be combined to generate domain-specific encryption keys. These keys are used for a variety of different purposes from phone number privacy to account backup encryption. It's very important to keep your BLS key share safe. We provide the following recommended best practices for keeping your key secure.

#### Leverage a cloud keystore

All cloud providers have a keystore offering that keeps your key secure while still being accessible by your service. ODIS Signer supports Azure, GCP, and AWS keystores. You can find configuration details in the [Keystores](#keystores) section below.

#### Lock down your cloud

- [ ] Ensure that you have multi-factor authentication enabled for all cloud accounts.
- [ ] Reduce access to the ODIS resources to as minimal of a set of people as possible.
- [ ] Revisit your cloud's admin set and ensure it is up to date.
- [ ] Enable Just-In-Time access policies if your cloud provider has this functionality available. For example, Azure provides [Privileged Identity Management](https://docs.microsoft.com/en-us/azure/active-directory/privileged-identity-management/pim-configure) which allows you to specify an approval list and limited time window in which an employee may access a given resource.
- [ ] Monitor/Audit access to the keystore and ODIS resource group.

#### Create a secure backup

The BLS key share should only exist in the keystore or as an encrypted backup. To create a backup, you can either download an encrypted copy from your keystore or manually encrypt it locally. Make sure that you keep it somewhere memorable (ex. external hard drive or password manager). Here are a couple options to create a local encrypted backup:

- [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/general/backup?tabs=azure-cli)
- [MacOS](https://support.apple.com/guide/mac-help/protect-your-mac-information-with-encryption-mh40593/mac)
- [Windows](https://support.microsoft.com/en-us/windows/how-to-encrypt-a-file-1131805c-47b8-2e3e-a705-807e13c10da7)
- [GPG Command](https://www.gnupg.org/gph/en/manual/x110.html)

### Keystores

Currently, the service supports Azure Key Vault (AKV), Google Secret Manager and AWS Secrets Manager.
You must specify the type, and then the keystore configs for that type as follows.

- `KEYSTORE_TYPE` - `AzureKeyVault`, `GoogleSecretManager` or `AWSSecretManager`

In addition, you must name your keys in your keystore according to the pattern `<keyName>-<keyVersion>` where

- `keyName` is configurable via the env variables `PHONE_NUMBER_PRIVACY_KEY_NAME_BASE` and `DOMAINS_KEY_NAME_BASE` which default to `phoneNumberPrivacy` and `domains` respectively.
- `keyVersion` is an integer corresponding to the iteration of the given key share. The variables `PHONE_NUMBER_PRIVACY_LATEST_KEY_VERSION` and `DOMAINS_LATEST_KEY_VERSION` should specify the latest version of the appropriate key share. This version will be fetched when the signer starts up.

For example, the first iteration of the key share used for phone number privacy should be stored as `phoneNumberPrivacy-1` and the second iteration (after resharing) should be stored as `phoneNumberPrivacy-2` unless you specify a `PHONE_NUMBER_PRIVACY_KEY_NAME_BASE` env variable, in which case `phoneNumberPrivacy` should be replaced with that value. The version numbers and `-` delimeter are mandatory and not configurable.

**Note: if you modify the stored secrets, you must restart the signer to ensure the updated versions are used in the signer.**

#### Azure Key Vault

Use the following to configure the AKV connection. These values are generated when creating a service principal account (see [Configuring your Key Vault](https://www.npmjs.com/package/@azure/keyvault-keys#configuring-your-key-vault)). Or if the service is being hosted on Azure itself, authentication can be done by granted key access to the VM's managed identity, in which case the client_id, client_secret, and tenant configs can be left blank.

- `KEYSTORE_AZURE_VAULT_NAME` - The name of your Azure Key Vault.
- `KEYSTORE_AZURE_CLIENT_ID` - (Optional) The clientId of the service principal account that has [Get, List] access to secrets.
- `KEYSTORE_AZURE_CLIENT_SECRET` - (Optional) The client secret of the same service principal account.
- `KEYSTORE_AZURE_TENANT` - (Optional) The tenant that the service principal is a member of.

#### Google Secret Manager

Use the following to configure the Google Secret Manager. To authenticate with Google Cloud, you can see [Setting Up Authentication](https://cloud.google.com/docs/authentication/production). By default, the google lib will use the default app credentials assigned to the host VM. If the service is being run outside of GCP, you can manually set the `GOOGLE_APPLICATION_CREDENTIALS` env var to the path to a service account json file.

- `KEYSTORE_GOOGLE_PROJECT_ID` - The google cloud project id.

#### AWS Secrets Manager

Use the following to configure the AWS Secrets Manager. To authenticate with Amazon Web Services, you can see [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html). If you are running the signer inside AWS, we do recommend to authenticate using IAM Roles.

- `KEYSTORE_AWS_REGION` - The AWS Region code where the secret is, for example: `us-east-1`.
- `KEYSTORE_AWS_SECRET_KEY` - The key for the secret key/value pair.

## Operations

### Setup

The service requires a connection to a secret store and to a SQL database. The SQL connection parameters should be configured with the `DB_*` configs stated above. Before starting the service, be sure to create a database and set the name as the value in the `DB_DATABASE` environment variable.

#### Running locally or without docker

To run without docker, or for development, start by git cloning the planq-sdk. Next, run `yarn` from the monorepo root to install dependencies.

Then start the service: `yarn start`

#### Running in docker

Docker images for the signer service are published to Planq's [container registry on Google Cloud](https://console.cloud.google.com/gcr/images/celo-testnet/US/planq-sdk). Search for images with tag `phone-number-privacy-*`. Then pull the image:

`docker pull us.gcr.io/celo-testnet/planq-sdk:phone-number-privacy-{LATEST_TAG_HERE}`

To start the service, run:

`docker run -d -p 80:8080 {ENV_VARS_HERE} {IMAGE_TAG_HERE}`

Then check on the service to make sure its running:

`docker container ls`

`docker logs -f {CONTAINER_ID_HERE}`

#### Key rotations

After a key resharing, signers should rotate their key shares as follows:

1. Store the new key share in the keystore according to the naming convention specified in the [Keystores](#keystores) section above.
2. Increment `PHONE_NUMBER_PRIVACY_LATEST_KEY_VERSION` or `DOMAINS_LATEST_KEY_VERSION` as appropriate. This will instruct the signer to prefetch this new key version the next time it starts up, but there is no need to restart the signer at this point.
3. Notify the combiner operator that your signer is ready for the key rotation.
4. The combiner operator will run e2e tests against your signer to verify it has the correct key configuration.
5. The combiner operator will update the combiner to request the new key share version via a custom request header field once all signers are ready.
6. The signers will fetch the new key shares from their keystores upon receiving these requests.
7. When the combiner operator sees that all signers are signing with the new key share and confirms that the system is healthy, signers will be instructed to delete their old key shares. Deleting the deprecated key shares ensures they cannot be stored and used by an attacker.

### Validate before going live

You can test your mainnet service is set up correctly by running specific tests in the e2e suite ("[Signer configuration test]" cases) which check signatures against the public polynomial for the respective APIs. Because the tests require quota, you must first point your provider endpoint to Atlas.

1. Change your signer’s blockchain provider (`BLOCKCHAIN_PROVIDER`) to Atlas Forno: `https://evm-atlas.planq.network`
2. Navigate to the signer directory in monorepo (this directory).
3. Modify the .env file:

   - Change `ODIS_SIGNER_SERVICE_URL` to your service endpoint.

4. Run `yarn test:signer:mainnet`.

   *Technical note: this command intentionally points the test's blockchain provider to Atlas, in order to top up quota on Atlas before running the test cases. It still verifies signatures against the respective mainnet polynomials.*
5. Verify that all tests pass.
6. Change your signer’s blockchain provider back to its original value (if using Forno: `https://forno.celo.org`).

### Logs

Error logs will be prefixed with `PLQ_ODIS_ERROR_XX`. You can see a full list of them in [errors.ts](https://github.com/planq-network/planq-sdk/blob/master/packages/phone-number-privacy/common/src/interfaces/errors.ts) in the common package.
