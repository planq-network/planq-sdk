import { MinimalContact } from '@planq-network/base/lib/contacts'
import { keccak256 } from 'web3-utils'

// Exports moved to @planq-network/base, forwarding them
// here for backwards compatibility
export {
  ContactPhoneNumber,
  getContactPhoneNumber,
  isContact,
  MinimalContact,
} from '@planq-network/base/lib/contacts'

/**
 * @deprecated May be removed in future
 */
export const getContactNameHash = (contact: MinimalContact) => {
  if (!contact) {
    throw new Error('Invalid contact')
  }

  return keccak256(contact.displayName || '')
}
