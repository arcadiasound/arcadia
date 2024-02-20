import { BuyAssetProps, ListAssetProps } from "@/types";
import { initSigner, orderbook } from "../arweave";

export const buyAsset = async ({ assetId, spend, address }: BuyAssetProps) => {
  try {
    const signer = await initSigner();

    const res = await orderbook.buy({
      assetId,
      spend,
      wallet: signer,
      walletAddress: address,
    });

    console.log({ res });
    return res;
  } catch (error) {
    console.error(error);
    throw new Error(
      `An error occurred trying to buy asset with ID: ${assetId}`
    );
  }
};
