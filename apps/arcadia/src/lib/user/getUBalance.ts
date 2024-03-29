import { appConfig } from "@/config";
import { UCMAssetProps } from "@/types";
import BigNumber from "bignumber.js";

export const getUBalance = async (address: string) => {
  try {
    const res = await fetch(`${appConfig.dreU}/contract?id=${appConfig.U}&errorMessages=true`);

    if (!res.ok) {
      throw new Error(
        `Error occurred getting asset listed status: ${res.statusText} with code ${res.status}`
      );
    }

    const data: UCMAssetProps & { state: { divisibility: number } } = await res.json();
    const state = data.state;

    if (state.balances.hasOwnProperty(address)) {
      return new BigNumber(state.balances[address] / state.divisibility);
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error occurred getting U balance", error);
    return 0;
    // throw new Error("Error occurred getting U balance");
  }
};
