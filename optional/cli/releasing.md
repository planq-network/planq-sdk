# how to release new versions

- change all @planq-network/** dependencies which are pointing to the unpublished -dev version to published versions

- check that @planq-network/phone-number-privacy-common in @planq-network/identity  and @planq-network/encrypted-backup packages points to a published version. (actually check on npm because just removing -dev might not be enough)

- update cli version in cli/package.json to next version with a pre-release (eg -beta.x) suffix

- run `yarn generate:shrinkwrap` (if you got some nonsense about @planq-network/phone-number-privacy-signer not being found try removing from peer deps of combiner running yarn again and retrying)

- commit the the package.json and shrinkwrap

- run `yarn prepack`

- *IMPORTANT* double check version in package.json is correct!

- run `npm publish --otp XXXXXX --tag TAG` *you MUST run with --tag and provide alpha | beta for pre release*

- add back -dev suffics to @planq-network/** deps it was removed from in cli package (otherwise ci build will fail)

- run yarn

- commit
