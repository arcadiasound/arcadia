import { removeDuplicatesByTxid } from "@/utils";
import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";

export const getRecentTracks = async (gateway: string) => {
  try {
    const res = await arweaveGql(`${gateway}/graphql`).getTransactions({
      first: 10,
      sort: SortOrder.HeightAsc,
      tags: [
        {
          name: "Content-Type",
          values: ["audio/mpeg", "audio/wav", "audio/aac"],
        },
        {
          name: "Indexed-By",
          values: ["ucm"],
        },
        {
          name: "App-Name",
          values: ["SmartWeaveContract"],
        },
        {
          name: "App-Version",
          values: ["0.3.0"],
        },
        {
          name: "Contract-Src",
          values: ["Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ"],
        },
      ],
    });

    console.log("res", res);

    const data = res.transactions.edges
      .filter((edge) => Number(edge.node.data.size) < 1e7)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      // .filter(
      //   (edge) => edge.node.tags.find((x) => x.name === "Thumbnail")?.value
      // )
      .map((edge) => setTrackInfo(edge.node as Transaction, gateway));

    const dedupedData = removeDuplicatesByTxid(data);

    return dedupedData;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
