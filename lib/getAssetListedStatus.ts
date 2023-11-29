import { appConfig } from "@/appConfig";

export const getAssetListedStatus = async (assetId: string) => {
  try {
    const result = await fetch(
      `${appConfig.dreU}/contract?id=${assetId}&errorMessages=true`
    );
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};
