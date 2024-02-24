import { GetTrack } from "@/types/query";
import { gql } from "../helpers/gql";
import { appConfig } from "@/config";
import { setTrackInfo } from "../helpers/setTrackInfo";
import { TransactionEdge } from "arweave-graphql";
import { Track } from "@/types";

export const getTrack = async ({ txid }: GetTrack) => {
  try {
    const res = await gql({
      variables: {
        ids: [txid],
        tags: [
          {
            name: "Content-Type",
            values: appConfig.acceptedFileTypes.streamableAudio,
          },
        ],
      },
    });

    const tracks = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter((edge) => edge.node.tags.find((x) => x.name === "Thumbnail"))
      .filter((edge) => edge.node.tags.find((x) => x.name === "Artwork"))
      .map((edge) => setTrackInfo(edge as TransactionEdge));

    return tracks;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};
