import { getUCMState } from "../getUCMState";

interface GetActiveSaleOrderProps {
  assetId: string;
}

export const getActiveSaleOrders = async ({
  assetId,
}: GetActiveSaleOrderProps) => {
  try {
    const res = await getUCMState();

    const state = res.state;

    const matchingPair = state.pairs.find((item) =>
      item.pair.includes(assetId)
    );

    return matchingPair ? matchingPair.orders : [];
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};
