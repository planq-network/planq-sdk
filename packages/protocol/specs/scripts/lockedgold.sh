certoraRun specs/harnesses/PlanqTokenHarness.sol specs/harnesses/LockedPlanqHarness.sol \
  --link LockedPlanqHarness:planqToken=PlanqTokenHarness \
  --verify LockedPlanqHarness:specs/lockedPlanq.spec \
  --optimistic_loop \
  --short_output \
  --msg "LockedPlanq" \
  --solc_args "['--evm-version', 'istanbul']"
