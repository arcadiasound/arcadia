import arweaveGql, { Transaction } from "arweave-graphql";
import { arweave } from "./arweave";

export const getRecentAlbums = async (gateway: string) => {
  try {
    const res = await arweaveGql(`${gateway}/graphql`).getTransactions({
      first: 6,
      tags: [
        {
          name: "Content-Type",
          values: ["application/json"],
        },
        {
          name: "Data-Protocol",
          values: ["Collection"],
        },
        {
          name: "Collection-Type",
          values: ["music", "music-album", "audio"],
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

    console.log("res", res);

    const data = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .map((edge) => setAlbumInfo(edge.node as Transaction, gateway));

    // console.log(data);

    return Promise.all(data);
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data: " + error.message);
  }
};

const setAlbumInfo = async (node: Transaction, gateway: string) => {
  const title = node.tags.find((x) => x.name === "Title")?.value;

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

  const txid = node.id;

  let tracks: string[] = [];

  try {
    const res = await arweave.api.get(txid);
    tracks = res.data;
  } catch (error) {
    throw new Error(("An error occured getting album tracks: " + error) as any);
  }

  return {
    title,
    creator,
    artworkId,
    txid,
    tracks,
  };
};
