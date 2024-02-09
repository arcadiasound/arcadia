import { appConfig } from "@/appConfig";
import { UCMAssetProps } from "@/types";

export const getUCMAsset = async (assetId: string) => {
  try {
    const res = await fetch(
      `${appConfig.dreU}/contract?id=${assetId}&errorMessages=true`
    );

    if (!res.ok) {
      throw new Error(
        `Error occurred getting asset listed status: ${res.statusText} with code ${res.status}`
      );
    }

    const data: UCMAssetProps = await res.json();
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error occurred getting asset with ID: ${assetId}`);
  }
};
