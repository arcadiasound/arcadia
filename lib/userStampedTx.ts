import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";
import { arweave } from "./arweave";

export const userStampedTx = async (
  id: string,
  address: string,
  gateway?: string
) => {
  try {
    const res = await arweaveGql(
      `${gateway || "https://arweave.net"}/graphql`
    ).getTransactions({
      first: 1,
      owners: [address],
      tags: [
        {
          name: "Protocol-Name",
          values: ["Stamp"],
        },
        {
          name: "Data-Source",
          values: [id],
        },
      ],
    });

    const data = res.transactions.edges;

    // console.log({ data });

    const userHasStampedTx = data.length > 0;

    return userHasStampedTx;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
