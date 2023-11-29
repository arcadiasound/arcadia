import { appConfig } from "@/appConfig";
import { Track } from "@/types";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, { Transaction } from "arweave-graphql";

export const getRecentTracks = async () => {
  try {
    const res = await arweaveGql(
      `${appConfig.defaultGateway}/graphql`
    ).getTransactions({
      first: 30,
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

    // console.log("res", res);

    const data = res.transactions.edges
      .filter((edge) => Number(edge.node.data.size) < 1e8)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter(
        (edge) => edge.node.tags.find((x) => x.name === "Thumbnail")?.value
      )
      .map((edge) =>
        setTrackInfo(edge.node as Transaction, appConfig.defaultGateway)
      );

    const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));
    return dedupedData;

    // return data;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
