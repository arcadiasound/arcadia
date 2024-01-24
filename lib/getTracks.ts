import { Transaction } from "arweave-graphql";
import { gql } from "./helpers";
import { setTrackInfoWithDuration } from "./getTrack";
import { appConfig } from "@/appConfig";
import { userPreferredGateway } from "@/utils";
import { MutableRefObject } from "react";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
  reorderArrayByTxid,
} from "@/utils/query";

export const getTracks = async (
  txids: string[],
  audioContext: MutableRefObject<AudioContext | null>
) => {
  console.log(txids);
  try {
    const res = await gql({
      variables: {
        ids: txids,
        first: txids.length,
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
        ],
      },
    });

    console.log(res.transactions.edges);

    const data = res.transactions.edges
      // .filter((edge) => Number(edge.node.data.size) < 1e7)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .map((edge) =>
        setTrackInfoWithDuration(
          edge.node as Transaction,
          audioContext,
          userPreferredGateway() || appConfig.defaultGateway
        )
      );

    const tracks = await Promise.all(data);

    console.log({ tracks });

    const dedupedTracks = removeDuplicatesByCreator(
      removeDuplicatesByTxid(tracks)
    );

    const reorderedTracks = reorderArrayByTxid(dedupedTracks, txids);

    return reorderedTracks;
  } catch (error) {
    throw error;
  }
};
