import { appConfig } from "@/apps/arcadia/appConfig";
import { warp } from "./arweave";

export const getAssetOwners = async (assetId: string) => {
  const asset = warp.contract(assetId).setEvaluationOptions({
    allowBigInt: true,
    internalWrites: true,
    unsafeClient: "skip",
    remoteStateSyncEnabled: true,
    remoteStateSyncSource: appConfig.dreU,
  });

  const { cachedValue } = await asset.readState();
  console.log(cachedValue);
  return cachedValue.state as any;
};
