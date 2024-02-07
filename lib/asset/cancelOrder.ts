import { CancelOrderProps } from "@/types";
import { initSigner, orderbook } from "../arweave";

export const cancelOrder = async ({ address, orderId }: CancelOrderProps) => {
  try {
    const signer = await initSigner();

    const cancelOrder = await orderbook.cancel({
      orderId,
      walletAddress: address,
      wallet: signer,
    });

    console.log({ cancelOrder });
    return cancelOrder;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred trying to cancel your listing");
  }
};
