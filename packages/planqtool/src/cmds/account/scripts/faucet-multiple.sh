#!/usr/bin/env bash
set -euo pipefail

PLQ="$(dirname "$0")/../../../../../../.."

cd $PLQ/planq-sdk && yarn build-sdk $1;

$PLQ/planq-sdk/packages/planqtool/bin/planqtooljs.sh port-forward -e $1 &
sleep 5;

$PLQ/planq-sdk/packages/planqtool/bin/planqtooljs.sh account faucet-multiple-helper -e $1 --accounts $2

killall -9 kubectl;
