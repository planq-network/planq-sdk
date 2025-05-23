import { ServiceContext as OdisServiceContext } from '@planq-network/identity/lib/odis/query'
import {
  checkSequentialDelayRateLimit,
  DomainEndpoint,
  domainHash,
  DomainQuotaStatusRequest,
  DomainQuotaStatusResponse,
  DomainRestrictedSignatureRequest,
  DomainRestrictedSignatureResponse,
  PoprfServer,
  SequentialDelayDomain,
  SequentialDelayDomainState,
  verifyDomainQuotaStatusRequestAuthenticity,
  verifyDomainRestrictedSignatureRequestAuthenticity,
} from '@planq-network/phone-number-privacy-common'
import * as poprf from '@celo/poprf'
import debugFactory from 'debug'

const debug = debugFactory('kit:encrypted-backup:odis:mock')

const MOCK_ODIS_KEYPAIR = poprf.keygen(Buffer.from('MOCK ODIS KEYPAIR SEED'))

export const MOCK_ODIS_ENVIRONMENT: OdisServiceContext = {
  odisUrl: 'https://mockodis.com',
  odisPubKey: Buffer.from(MOCK_ODIS_KEYPAIR.publicKey).toString('base64'),
}

export class MockOdis {
  static readonly environment = MOCK_ODIS_ENVIRONMENT

  readonly state: Record<string, SequentialDelayDomainState> = {}
  readonly poprf = new PoprfServer(MOCK_ODIS_KEYPAIR.privateKey)

  private now = () => Math.floor(Date.now() / 1000)

  private domainState(hash: Buffer) {
    return (
      this.state[hash.toString('hex')] ?? { timer: 0, counter: 0, disabled: false, now: this.now() }
    )
  }

  quota(req: DomainQuotaStatusRequest<SequentialDelayDomain>): {
    status: number
    body: DomainQuotaStatusResponse
  } {
    const authorized = verifyDomainQuotaStatusRequestAuthenticity(req)
    if (!authorized) {
      return {
        status: 401,
        body: {
          success: false,
          version: 'mock',
          error: 'unauthorized',
        },
      }
    }

    return {
      status: 200,
      body: {
        success: true,
        version: 'mock',
        status: this.domainState(domainHash(req.domain)),
      },
    }
  }

  sign(req: DomainRestrictedSignatureRequest<SequentialDelayDomain>): {
    status: number
    body: DomainRestrictedSignatureResponse
  } {
    const authorized = verifyDomainRestrictedSignatureRequestAuthenticity(req)
    if (!authorized) {
      return {
        status: 401,
        body: {
          success: false,
          version: 'mock',
          error: 'unauthorized',
          status: undefined,
        },
      }
    }

    const hash = domainHash(req.domain)
    const domainState = this.domainState(hash)
    const nonce = req.options.nonce.defined ? req.options.nonce.value : undefined
    if (nonce !== domainState.counter) {
      return {
        status: 403,
        body: {
          success: false,
          version: 'mock',
          error: 'incorrect nonce',
          status: domainState,
        },
      }
    }

    const limitCheck = checkSequentialDelayRateLimit(req.domain, this.now(), domainState)
    if (!limitCheck.accepted || limitCheck.state === undefined) {
      return {
        status: 429,
        body: {
          success: false,
          version: 'mock',
          error: 'request limit exceeded',
          status: domainState,
        },
      }
    }
    this.state[hash.toString('hex')] = limitCheck.state

    let signature: string
    try {
      signature = this.poprf
        .blindEval(hash, Buffer.from(req.blindedMessage, 'base64'))
        .toString('base64')
    } catch (error) {
      return {
        // TODO(victor) Note that although this is a returned as a 500, the fault my actually be the
        // users because the blinded message is not validated in JS before attempting the evaluation.
        // This logic is the same in the real service. When validation functions are added to the
        // WASM interface for the POPRF, this can be improved.
        status: 500,
        body: {
          success: false,
          version: 'mock',
          status: undefined,
          error: (error as Error).toString(),
        },
      }
    }

    return {
      status: 200,
      body: {
        success: true,
        version: 'mock',
        status: limitCheck.state,
        signature,
      },
    }
  }

  installQuotaEndpoint(mock: typeof fetchMock, override?: any) {
    mock.mock(
      {
        url: new URL(DomainEndpoint.DOMAIN_QUOTA_STATUS, MockOdis.environment.odisUrl).href,
        method: 'POST',
      },
      override ??
        ((url: string, req: { body: string }) => {
          const res = this.quota(
            JSON.parse(req.body) as DomainQuotaStatusRequest<SequentialDelayDomain>
          )
          debug('Mocking request', JSON.stringify({ url, req, res }))
          return res
        })
    )
  }

  installSignEndpoint(mock: typeof fetchMock, override?: any) {
    mock.mock(
      {
        url: new URL(DomainEndpoint.DOMAIN_SIGN, MockOdis.environment.odisUrl).href,
        method: 'POST',
      },
      override ??
        ((url: string, req: { body: string }) => {
          const res = this.sign(
            JSON.parse(req.body) as DomainRestrictedSignatureRequest<SequentialDelayDomain>
          )
          debug('Mocking request', JSON.stringify({ url, req, res }))
          return res
        })
    )
  }

  install(mock: typeof fetchMock) {
    this.installQuotaEndpoint(mock)
    this.installSignEndpoint(mock)
  }
}
