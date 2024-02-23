import { formatTime } from "@/utils";
import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";
import { MutableRefObject } from "react";
import { arweave } from "./arweave";

export const getTrackDescription = async (id: string) => {
  try {
    const res = await arweaveGql(
      `${"https://arweave.net"}/graphql`
    ).getTransactions({
      first: 1,
      tags: [
        {
          name: "Content-Type",
          values: ["text/plain"],
        },
        {
          name: "Related-To",
          values: [id],
        },
        {
          name: "Related-Type",
          values: ["Description"],
        },
      ],
    });

    const data = res.transactions.edges;

    if (data.length) {
      const txid = await data[0].node.id;

      const descriptionRes = await arweave.api.get(txid);

      const descriptionData = descriptionRes.data;

      return descriptionData;
    } else {
      return "";
    }
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
