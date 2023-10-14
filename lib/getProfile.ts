import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";
import { arweave } from "./arweave";
import ArweaveAccount, { ArAccount } from "arweave-account";

const account = new ArweaveAccount();

export const getProfile = async (address: string, gateway?: string) => {
  try {
    const acc: ArAccount = await account.get(address);
    return acc;
  } catch (error: any) {
    throw new Error(
      "Error occured whilst fetching profile data:",
      error.message
    );
  }
};
