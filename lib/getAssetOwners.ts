import { appConfig } from "@/appConfig";
import { warp } from "./arweave";

export const getAssetOwners = async (assetId: string) => {
  console.log(assetId);
  const asset = warp.contract(assetId).setEvaluationOptions({
    allowBigInt: true,
    internalWrites: true,
    unsafeClient: "skip",
    remoteStateSyncEnabled: true,
    remoteStateSyncSource: appConfig.dreU,
  });

  const { cachedValue } = await asset.readState();
  return cachedValue.state as any;
};
