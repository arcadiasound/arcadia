import { Transaction } from "arweave-graphql";

export const setTrackInfo = (node: Transaction, gateway: string) => {
  const title = node.tags.find((x) => x.name === "Title")?.value;

  let hasLicense = false;

  const licenseTx = node.tags.find((x) => x.name === "License")?.value;
  const access = node.tags.find((x) => x.name === "Access")?.value;
  const accessFee = node.tags.find((x) => x.name === "Access-Fee")?.value;

  if (
    licenseTx === "yRj4a5KMctX_uOmKWCFJIjmY8DeJcusVk6-HzLiM_t8" &&
    access === "Restricted"
  ) {
    hasLicense = true;
  }

  let creator: string;

  try {
    // find owner from balances
    const initStateTag = node.tags.find((x) => x.name === "Init-State")?.value;

    const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

    const assetOwner = Object.keys(initState.balances)[0];

    creator = assetOwner;
  } catch (error) {
    creator = node.owner.address;
  }

  const artworkId =
    node.tags.find((x) => x.name === "Cover-Artwork")?.value ||
    node.tags.find((x) => x.name === "Thumbnail")?.value;

  const src = gateway + "/" + node.id;
  const txid = node.id;

  return {
    title,
    creator,
    artworkId,
    src,
    hasLicense,
    txid,
    accessFee,
  };
};
