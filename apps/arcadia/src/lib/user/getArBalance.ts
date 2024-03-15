import BigNumber from "bignumber.js";
import { arweave } from "../arweave";

export const getArBalance = async (address: string) => {
  const winstonBalance = await arweave.wallets.getBalance(address);
  const arBalance = await arweave.ar.winstonToAr(winstonBalance);

  return new BigNumber(arBalance);
};
