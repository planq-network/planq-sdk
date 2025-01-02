import {Connection} from "../connection";
import {PlanqTx} from "../types";

function isEmpty(value: string | undefined) {
  return (
    value === undefined ||
    value === null ||
    value === "0" ||
    value.toLowerCase() === "0x" ||
    value.toLowerCase() === "0x0"
  );
}

export class TxParamsNormalizer {
  private chainId: number | null = null;

  constructor(readonly connection: Connection) {}

  public async populate(planqTxParams: PlanqTx): Promise<PlanqTx> {
    const txParams = {...planqTxParams};

    if (txParams.chainId == null) {
      txParams.chainId = await this.getChainId();
    }

    if (txParams.nonce == null) {
      txParams.nonce = await this.connection.nonce(txParams.from!.toString());
    }

    if (!txParams.gas || isEmpty(txParams.gas.toString())) {
      txParams.gas = await this.connection.estimateGas(txParams);
    }

    return txParams;
  }

  private async getChainId(): Promise<number> {
    if (this.chainId === null) {
      this.chainId = await this.connection.chainId();
    }
    return this.chainId;
  }
}
