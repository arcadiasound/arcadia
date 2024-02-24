import { gateway } from "@/utils";
import { TransactionEdge } from "arweave-graphql";

export const setTrackInfo = (edge: TransactionEdge) => {
  // casting as the filter in query func is/should be ensuring value exists
  const title = edge.node.tags.find((x) => x.name === "Title")?.value as string;

  let creator: string;

  try {
    const initStateTag = edge.node.tags.find(
      (x) => x.name === "Init-State"
    )?.value;

    const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

    const assetOwner = Object.keys(initState.balances)[0];

    creator = assetOwner;
  } catch (error) {
    creator = edge.node.owner.address;
  }

  // casting as the filter in query func is/should be ensuring value exists
  const thumbnailId = edge.node.tags.find((x) => x.name === "Thumbnail")
    ?.value as string;
  const artworkId = edge.node.tags.find((x) => x.name === "Artwork")
    ?.value as string;

  const thumbnailSrc = gateway() + "/" + thumbnailId;
  const artworkSrc = gateway() + "/" + artworkId;
  const audioSrc = gateway() + "/" + edge.node.id;
  const txid = edge.node.id;
  const cursor = edge.cursor;

  return {
    txid,
    title,
    creator,
    audioSrc,
    thumbnailSrc,
    artworkSrc,
    cursor,
  };
};
