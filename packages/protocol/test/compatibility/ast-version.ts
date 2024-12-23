import { getContractVersion } from '@planq-network/protocol/lib/compatibility/ast-version'
import { DEFAULT_VERSION_STRING } from '@planq-network/protocol/lib/compatibility/version'
import { getTestArtifacts } from '@planq-network/protocol/test/compatibility/common'
import { assert } from 'chai'

const testCases = {
  original: getTestArtifacts('original'),
  versioned: getTestArtifacts('versioned'),
}

describe('#getContractVersion()', () => {
  describe('when the contract implements getVersionNumber()', () => {
    it('returns the correct version number', async () => {
      const version = await getContractVersion(
        testCases.versioned.getArtifactByName('TestContract')
      )
      assert.equal(version.toString(), '1.2.3.4')
    })
  })

  describe('when the contract does not implement getVersionNumber()', () => {
    it('returns the default version number', async () => {
      const version = await getContractVersion(testCases.original.getArtifactByName('TestContract'))
      assert.equal(version.toString(), DEFAULT_VERSION_STRING)
    })
  })
})
