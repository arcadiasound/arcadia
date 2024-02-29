import { gateway } from "@/utils";
import { TransactionEdge } from "arweave-graphql";
import { arweave } from "../arweave";
import { Album } from "@/types";

export const setAlbumInfo = async (edge: TransactionEdge): Promise<Album> => {
  // casting as the filter in query func is/should be ensuring value exists
  const title = edge.node.tags.find((x) => x.name === "Title")?.value as string;

  let creator: string;

  try {
    const initStateTag = edge.node.tags.find((x) => x.name === "Init-State")?.value;

    const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

    const assetOwner = Object.keys(initState.balances)[0];

    creator = assetOwner;
  } catch (error) {
    creator = edge.node.owner.address;
  }

  // casting as the filter in query func is/should be ensuring value exists
  const thumbnailId = edge.node.tags.find((x) => x.name === "Thumbnail")?.value as string;
  const artworkId = edge.node.tags.find((x) => x.name === "Artwork")?.value as string;
  const releaseDate =
    Number(edge.node.tags.find((x) => x.name === "Release-Date")?.value) ||
    edge.node.block?.timestamp;

  const thumbnailSrc = gateway() + "/" + thumbnailId;
  const artworkSrc = gateway() + "/" + artworkId;
  const txid = edge.node.id;
  const cursor = edge.cursor;

  let trackIds: string[] = [];

  try {
    const res = await arweave.api.get(txid);
    trackIds = res.data.items;
  } catch (error) {
    console.error("An error occured getting album trackIds: " + error);
    // throw new Error("An error occured getting album trackIds: " + error as any);
  }

  return {
    txid,
    title,
    creator,
    thumbnailSrc,
    artworkSrc,
    trackIds,
    releaseDate,
    releaseType: "album",
    cursor,
  };
};
