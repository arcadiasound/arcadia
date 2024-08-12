import { GQLQuery } from "@/types";
import { gateway } from "@/utils";
import arweaveGql, { Transaction, Query } from "arweave-graphql";

export const gql = async ({ variables }: GQLQuery) => {
  try {
    const res = await arweaveGql(`${gateway()}/graphql`).getTransactions({
      ...variables,
    });

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data: " + error.message);
  }
};
