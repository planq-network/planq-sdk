import { ContractKit } from '@planq-network/contractkit'
import { ClaimTypes, IdentityMetadataWrapper } from '@planq-network/contractkit/lib/identity'
import { Claim } from '@planq-network/contractkit/lib/identity/claims/claim'
import { VERIFIABLE_CLAIM_TYPES } from '@planq-network/contractkit/lib/identity/claims/types'
import { verifyClaim } from '@planq-network/contractkit/lib/identity/claims/verify'
import { eqAddress } from '@planq-network/utils/lib/address'
import { concurrentMap } from '@planq-network/utils/lib/async'
import { NativeSigner } from '@planq-network/utils/lib/signatureUtils'
import { toChecksumAddress } from '@ethereumjs/util'
import { cli } from 'cli-ux'
import { writeFileSync } from 'fs'
import moment from 'moment'
import { BaseCommand } from '../base'
import { Args, Flags } from './command'

export abstract class ClaimCommand extends BaseCommand {
  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({
      required: true,
      description:
        'Address of the account to set metadata for or an authorized signer for the address in the metadata',
    }),
  }
  static args = [Args.file('file', { description: 'Path of the metadata file' })]
  public requireSynced: boolean = false
  // We need this to properly parse flags for subclasses
  protected self = ClaimCommand

  protected async checkMetadataAddress(address: string, from: string) {
    if (eqAddress(address, from)) {
      return
    }
    const accounts = await this.kit.contracts.getAccounts()
    const signers = await accounts.getCurrentSigners(address)
    if (!signers.some((a) => eqAddress(a, from))) {
      throw new Error(
        'Signing metadata with an address that is not the account or one of its signers'
      )
    }
  }

  protected readMetadata = async () => {
    const { args, flags } = this.parse(this.self)
    const filePath = args.file
    try {
      cli.action.start(`Read Metadata from ${filePath}`)
      const data = await IdentityMetadataWrapper.fromFile(
        await this.kit.contracts.getAccounts(),
        filePath
      )
      await this.checkMetadataAddress(data.data.meta.address, flags.from)
      cli.action.stop()
      return data
    } catch (error) {
      cli.action.stop(`Error: ${error}`)
      throw error
    }
  }

  protected get signer() {
    const res = this.parse(this.self)
    const address = toChecksumAddress(res.flags.from)
    return NativeSigner(this.kit.connection.sign, address)
  }

  protected async addClaim(metadata: IdentityMetadataWrapper, claim: Claim): Promise<Claim> {
    try {
      cli.action.start(`Add claim`)
      const addedClaim = await metadata.addClaim(claim, this.signer)
      cli.action.stop()
      return addedClaim
    } catch (error) {
      cli.action.stop(`Error: ${error}`)
      throw error
    }
  }

  protected writeMetadata = (metadata: IdentityMetadataWrapper) => {
    const { args } = this.parse(this.self)
    const filePath = args.file

    try {
      cli.action.start(`Write Metadata to ${filePath}`)
      writeFileSync(filePath, metadata.toString())
      cli.action.stop()
    } catch (error) {
      cli.action.stop(`Error: ${error}`)
      throw error
    }
  }
}

export const claimArgs = [Args.file('file', { description: 'Path of the metadata file' })]

export const displayMetadata = async (
  metadata: IdentityMetadataWrapper,
  kit: ContractKit,
  tableFlags: object = {}
) => {
  const data = await concurrentMap(5, metadata.claims, async (claim) => {
    const verifiable = VERIFIABLE_CLAIM_TYPES.includes(claim.type)
    const status = verifiable ? await verifyClaim(kit, claim, metadata.data.meta.address) : 'N/A'
    let extra = ''
    switch (claim.type) {
      case ClaimTypes.DOMAIN:
        extra = `Domain: ${claim.domain}`
        break
      case ClaimTypes.KEYBASE:
        extra = `Username: ${claim.username}`
        break
      case ClaimTypes.NAME:
        extra = `Name: "${claim.name}"`
        break
      case ClaimTypes.STORAGE:
        extra = `URL: "${claim.address}"`
        break
      default:
        extra = JSON.stringify(claim)
        break
    }
    return {
      type: claim.type,
      extra,
      status: verifiable ? (status ? `Could not verify: ${status}` : 'Verified!') : 'N/A',
      createdAt: moment.unix(claim.timestamp).fromNow(),
    }
  })

  cli.table(
    data,
    {
      type: { header: 'Type' },
      extra: { header: 'Value' },
      status: { header: 'Status' },
      createdAt: { header: 'Created At' },
    },
    tableFlags
  )
}

export const modifyMetadata = async (
  kit: ContractKit,
  filePath: string,
  operation: (metadata: IdentityMetadataWrapper) => Promise<void>
) => {
  const metadata = await IdentityMetadataWrapper.fromFile(
    await kit.contracts.getAccounts(),
    filePath
  )
  await operation(metadata)
  writeFileSync(filePath, metadata.toString())
}
