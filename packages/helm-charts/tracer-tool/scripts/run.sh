FIRST_ACCOUNT="0x4da58d267cd465b9313fdb19b120ec591d957ad2";
SECOND_ACCOUNT="0xc70947239385c2422866e20b6cafffa29157e4b3";
PLQTOOL="/planq-sdk/packages/planqtool/bin/planqtooljs.sh";
GETH_DIR="/planq-sdk/node_modules/@planq-network/geth";
DATA_DIR="/geth-data";
ENV_NAME="$(cat /root/envname)"

wget https://dl.google.com/go/go1.11.5.linux-amd64.tar.gz;
tar xf go1.11.5.linux-amd64.tar.gz -C /tmp;
PATH=$PATH:/tmp/go/bin;

cd "/planq-sdk" && yarn run build-sdk $ENV_NAME;

mkdir $DATA_DIR;

$PLQTOOL geth build --geth-dir $GETH_DIR -c &&
$PLQTOOL geth init --geth-dir $GETH_DIR --data-dir $DATA_DIR -e $ENV_NAME --genesis "/geth/genesis.json" --fetch-static-nodes-from-network=false;

cat /root/pk2740 >> $DATA_DIR/keystore/UTC--2019-03-02T04-27-40.724063000Z--c70947239385c2422866e20b6cafffa29157e4b3;
cat /root/pk2745 >> $DATA_DIR/keystore/UTC--2019-03-02T04-27-45.410695000Z--4da58d267cd465b9313fdb19b120ec591d957ad2;
cat /root/staticnodes >> $DATA_DIR/static-nodes.json;

echo "Running geth...";

$PLQTOOL geth run --geth-dir $GETH_DIR --data-dir $DATA_DIR --sync-mode ultralight --verbosity 1 &

sleep 15;

$PLQTOOL geth trace $FIRST_ACCOUNT $SECOND_ACCOUNT --data-dir $DATA_DIR -e $ENV_NAME
