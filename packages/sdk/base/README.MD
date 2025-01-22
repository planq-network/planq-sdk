
# @planq-network/base

This package contains shared classes and functions used by other planq packages. It was designed to have minimal external dependencies. (for shared planq functions that have big external dependencies see the @planq-network/utils, @planq-network/cryptographic-utils, @planq-network/phone-utils, @planq-network/network-utils packages)


## Notable Types

```typescript
// enums StableTokens and Token are enums, PlanqTokenType is the type that must be one of the 2 enums
import { StableTokens, Token, PlanqTokenType } from "@planq-network/base"

StableTokens.aUSD

StableTokens.aREAL

Token.PLQ
```

## Notable Functions

```typescript
import { eqAddress, normalizeAddress, isNullAddress } from "@planq-network/base"
```
