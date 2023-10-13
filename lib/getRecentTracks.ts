import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";
import { arweave } from "./arweave";

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
      ],
    });

    // console.log("res", res);

    const data = res.transactions.edges
      .filter((edge) => Number(edge.node.data.size) < 1e7)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .map((edge) => setTrackInfo(edge.node as Transaction, gateway));

    // console.log(data);

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};

const setTrackInfo = (node: Transaction, gateway: string) => {
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
