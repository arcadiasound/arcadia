import { appConfig } from "@/appConfig";
import { UCMContract } from "@/types";

export const getUCMState = async () => {
  try {
    const res = await fetch(
      `${appConfig.dreU}/contract?id=${appConfig.UCM}&errorMessages=true`
    );

    if (!res.ok) {
      throw new Error(
        `Error occurred getting sale order: ${res.statusText} with code ${res.status}`
      );
    }

    const data: UCMContract = await res.json();
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
