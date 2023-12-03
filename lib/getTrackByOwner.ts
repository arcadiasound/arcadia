import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, {
  SortOrder,
  Transaction,
  TransactionEdge,
} from "arweave-graphql";

export const getTrackByOwners = async (address: string, gateway?: string) => {
  try {
    const res = await arweaveGql(
      `${gateway || "https://arweave.net"}/graphql`
    ).getTransactions({
      owners: [address],
      tags: [
        {
          name: "Content-Type",
          values: ["audio/mpeg", "audio/wav", "audio/aac"],
        },
        {
          name: "App-Name",
          values: ["SmartWeaveContract"],
        },
      ],
    });

    const data = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter((edge) => {
        const initStateTag = edge.node.tags.find(
          (x) => x.name === "Init-State"
        )?.value;

        const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

        const creator = edge.node.tags.find((x) => x.name === "Creator")?.value;

        const txOwner = edge.node.owner.address;

        const isOwner =
          Object.keys(initState.balances).includes(txOwner) ||
          creator === txOwner;

        if (isOwner) {
          return true;
        } else {
          return false;
        }
      })
      .map((edge) =>
        setTrackInfo(edge as TransactionEdge, gateway || "https://arweave.net")
      );

    const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

    return dedupedData;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
