import { ListAssetProps } from "@/types";
import { initSigner, orderbook } from "../arweave";

export const listAsset = async ({
  assetId,
  qty,
  price,
  address,
}: ListAssetProps) => {
  try {
    const signer = await initSigner();

    const orderTx = await orderbook.sell({
      assetId,
      qty,
      price: price * 1e6,
      wallet: signer,
      walletAddress: address,
    });

    console.log({ orderTx });
    return orderTx;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred trying to create your listing");
  }
};
