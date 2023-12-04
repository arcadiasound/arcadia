import { appConfig } from "@/appConfig";
import { GQLQuery } from "@/types";
import { userPreferredGateway } from "@/utils";
import arweaveGql, { Transaction, Query } from "arweave-graphql";

export const gql = async ({ variables, gateway }: GQLQuery) => {
  try {
    const res = await arweaveGql(
      `${gateway || appConfig.defaultGateway}/graphql`
    ).getTransactions({
      ...variables,
    });

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
