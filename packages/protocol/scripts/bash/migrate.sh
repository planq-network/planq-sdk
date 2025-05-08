#!/usr/bin/env bash
set -euo pipefail

# Runs unmigrated truffle migrations in protocol/migrations/
#
# Flags:
# -n: Name of the network to migrate to
# -r: Reset network state by running all migrations

TRUFFLE_OVERRIDE=""
MIGRATION_OVERRIDE=""
NETWORK="atlas"
RESET=""
FROM="15"
TO="15"
# https://github.com/trufflesuite/truffle-migrate/blob/develop/index.js#L161
# Default to larger than the number of contracts we will ever have

while getopts 'n:rt:f:c:m:' flag; do
  case "${flag}" in
    n) NETWORK="$OPTARG" ;;
    r) RESET="--reset" ;;
    t) TO="$OPTARG" ;;
    f) FROM="$OPTARG" ;;
    c) TRUFFLE_OVERRIDE="$OPTARG" ;;
    m) MIGRATION_OVERRIDE="$OPTARG" ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done

[ -z "$NETWORK" ] && echo "Need to set the NETWORK via the -n flag" && exit 1;



yarn run build && \
echo "Migrating contracts migrations${FROM:+ from number $FROM}${TO:+ up to number $TO}" && \
yarn run truffle migrate --compile-all --network $NETWORK --build_directory $PWD/build/$NETWORK $RESET \
  ${TO:+ --to $TO} \
  ${FROM:+ -f $FROM} \
  --truffle_override "$TRUFFLE_OVERRIDE" \
  --migration_override "$MIGRATION_OVERRIDE"
