# Certora Specs

This directory contains all necessary material in order to execute the Certora Prover: spec files, run scripts, and harnesses.

## Spec files

### Accounts
- `accounts.spec` - general rules for the Accounts contract.
- `accountsPrivileged.spec` - rule for identifying the privileged subset of functions, that is, functions that can only be executed by a single party.

### LockedPlanq
- `lockedPlanq.spec` - general rules for the LockedPlanq contract.
- `locked_planq_linked.spec` - rules for LockedPlanq that are coupled with Accounts.

### Governance
- `governance.spec` - general rules for the Governance contract. (Not exhaustive.)
- `governancePrivileged.spec` - rule for identifying the privileged subset of functions, that is, functions that can only be executed by a single party.
- `governance_with_dequeue.spec` - rules for Governance that require reasoning about the dequeue mechanism
- `governance_old_rules.spec` - rules used in the 2019 formal verification project, and require some re-formulation.
- `governance-referendumVotes.spec` - a rule checking the consistency of referendum votes.
