import { appConfig } from "@/config";
import { getUCMAsset } from "../getUCMAsset";
import { TrackAssetOwner } from "@/types";

export const getOwners = async (txid: string) => {
  console.log("fetching track owners...");
  try {
    const trackAsset = await getUCMAsset(txid);
    const balances = Object.keys(trackAsset.state.balances).filter(
      // remove UCM as owner
      (address) => address !== appConfig.UCM
    );
    const ownership = Object.values(trackAsset.state.balances) as number[];

    const owners: TrackAssetOwner[] = [];

    for (let i = 0; i < balances.length; i++) {
      const address = balances[i];
      const amount = ownership[i];

      // catch edge case where user with 0% can show up
      if (amount === 0) {
        continue;
      }

      owners.push({
        address,
        ownershipAmount: amount,
      });
    }

    // Sort the owners array based on ownershipAmount in descending order
    return owners.sort((a, b) => b.ownershipAmount - a.ownershipAmount);
  } catch (error: any) {
    throw new Error(error);
  }
};
