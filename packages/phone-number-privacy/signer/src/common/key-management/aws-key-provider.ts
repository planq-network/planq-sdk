import { ErrorMessage, rootLogger } from '@planq-network/phone-number-privacy-common'
import { SecretsManager } from 'aws-sdk'
import { config } from '../../config'
import { Key, KeyProviderBase } from './key-provider-base'

interface SecretStringResult {
  [key: string]: string
}

export class AWSKeyProvider extends KeyProviderBase {
  public async fetchPrivateKeyFromStore(key: Key) {
    const logger = rootLogger(config.serviceName)
    try {
      // Credentials are managed by AWS client as described in https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
      const { region, secretKey } = config.keystore.aws
      const client = new SecretsManager({ region })
      client.config.update({ region })

      const customKeyVersionString = this.getCustomKeyVersionString(key)
      logger.debug(`Attempting to fetch key named: ${customKeyVersionString}`)
      const privateKey = await this.fetch(client, customKeyVersionString, secretKey)
      this.setPrivateKey(key, privateKey)
    } catch (err) {
      logger.info('Error retrieving key')
      logger.error(err)
      throw new Error(ErrorMessage.KEY_FETCH_ERROR)
    }
  }

  private async fetch(client: SecretsManager, secretName: string, secretKey: string) {
    // check for empty strings from undefined env vars
    if (!secretName) {
      throw new Error('key name is undefined')
    }

    const response = await client.getSecretValue({ SecretId: secretName }).promise()

    let privateKey
    if (response.SecretString) {
      privateKey = this.tryParseSecretString(response.SecretString, secretKey)
    } else if (response.SecretBinary) {
      // @ts-ignore AWS sdk typings not quite correct
      const buff = Buffer.from(response.SecretBinary, 'base64')
      privateKey = buff.toString('ascii')
    } else {
      throw new Error('Response has neither string nor binary')
    }

    if (!privateKey) {
      throw new Error('Secret is empty or undefined')
    }

    return privateKey
  }

  private tryParseSecretString(secretString: string, key: string) {
    if (!secretString) {
      throw new Error('Cannot parse empty string')
    }
    if (!key) {
      throw new Error('Cannot parse secret without key')
    }

    try {
      const secret = JSON.parse(secretString) as SecretStringResult
      return secret[key]
    } catch (e) {
      throw new Error('Expecting JSON, secret string is not valid JSON')
    }
  }
}
