import { Track } from "@/types";
import { gateway } from "@/utils";
import { TransactionEdge } from "arweave-graphql";

export const setTrackInfo = (edge: TransactionEdge): Track => {
  // casting as the filter in query func is/should be ensuring value exists
  const title = edge.node.tags.find((x) => x.name === "Title")?.value as string;

  let creator: string;

  try {
    const initStateTag = edge.node.tags.find((x) => x.name === "Init-State")?.value;

    const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

    const assetOwner = Object.keys(initState.balances)[0];

    creator = assetOwner;
  } catch (error) {
    const creatorTag = edge.node.tags.find((x) => x.name === "Creator");
    creator =
      creatorTag?.value && creatorTag.value.length === 43
        ? creatorTag.value
        : edge.node.owner.address;
  }

  const owner = edge.node.owner.address;

  // casting as the filter in query func is/should be ensuring value exists
  const thumbnailId = edge.node.tags.find((x) => x.name === "Thumbnail")?.value as string;
  const artworkId = edge.node.tags.find((x) => x.name === "Artwork")?.value as string;

  const thumbnailSrc = gateway() + "/" + thumbnailId;
  const artworkSrc = gateway() + "/" + artworkId;
  const audioSrc = gateway() + "/" + edge.node.id;
  const txid = edge.node.id;
  const cursor = edge.cursor;
  const releaseDate =
    Number(edge.node.tags.find((x) => x.name === "Release-Date")?.value) ||
    edge.node.block?.timestamp;
  const topics = edge.node.tags.filter((tag) => tag.name.includes("Topic")).map((tag) => tag.value);

  return {
    title,
    owner,
    creator,
    audioSrc,
    thumbnailSrc,
    artworkSrc,
    txid,
    releaseDate,
    releaseType: "single",
    cursor,
    topics,
  };
};
