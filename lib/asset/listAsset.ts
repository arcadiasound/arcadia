import { ListAssetProps } from "@/types";
import { orderbook } from "../arweave";

export const listAsset = async ({
  assetId,
  qty,
  price,
  address,
}: ListAssetProps) => {
  try {
    const orderTx = await orderbook.sell({
      assetId,
      qty,
      price,
      wallet: "use_wallet",
      walletAddress: address,
    });

    return orderTx;
  } catch (error) {
    throw error;
  }
};
