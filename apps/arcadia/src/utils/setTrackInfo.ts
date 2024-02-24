import { Transaction, TransactionEdge } from "arweave-graphql";

export const setTrackInfo = (edge: TransactionEdge, gateway: string) => {
  const title = edge.node.tags.find((x) => x.name === "Title")?.value;
  const description = edge.node.tags.find(
    (x) => x.name === "Description"
  )?.value;

  let hasLicense = false;

  const licenseTx = edge.node.tags.find((x) => x.name === "License")?.value;
  const access = edge.node.tags.find((x) => x.name === "Access")?.value;
  const accessFee = edge.node.tags.find((x) => x.name === "Access-Fee")?.value;

  if (
    licenseTx === "yRj4a5KMctX_uOmKWCFJIjmY8DeJcusVk6-HzLiM_t8" &&
    access === "Restricted"
  ) {
    hasLicense = true;
  }

  let creator: string;

  try {
    // find owner from balances
    const initStateTag = edge.node.tags.find(
      (x) => x.name === "Init-State"
    )?.value;

    const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

    const assetOwner = Object.keys(initState.balances)[0];

    creator = assetOwner;
  } catch (error) {
    creator = edge.node.owner.address;
  }

  const artworkId =
    edge.node.tags.find((x) => x.name === "Cover-Artwork")?.value ||
    edge.node.tags.find((x) => x.name === "Thumbnail")?.value;

  const src = gateway + "/" + edge.node.id;
  const txid = edge.node.id;
  const collectionCode = edge.node.tags.find(
    (x) => x.name === "Collection-Code"
  )?.value;
  const cursor = edge.cursor;

  return {
    title,
    description,
    creator,
    artworkId,
    src,
    txid,
    collectionCode,
    cursor,
  };
};
