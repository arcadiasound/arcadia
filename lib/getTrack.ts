import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";
import { arweave } from "./arweave";

export const getTrack = async (id: string, gateway?: string) => {
  try {
    const res = await arweaveGql(
      `${gateway || "https://arweave.net"}/graphql`
    ).getTransactions({
      first: 1,
      ids: [id],
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

    console.log({ res });

    const data = res.transactions.edges
      // .filter((edge) => Number(edge.node.data.size) < 1e7)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .map((edge) =>
        setTrackInfo(edge.node as Transaction, gateway || "https://arweave.net")
      );

    console.log({ data });

    return data[0];
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};

const setTrackInfo = (node: Transaction, gateway: string) => {
  const title = node.tags.find((x) => x.name === "Title")?.value;
  const description = node.tags.find((x) => x.name === "Description")?.value;

  let hasLicense = false;

  const licenseTx = node.tags.find((x) => x.name === "License")?.value;
  const access = node.tags.find((x) => x.name === "Access")?.value;
  const accessFee = node.tags.find((x) => x.name === "Access-Fee")?.value;
  const commercial = node.tags.find((x) => x.name === "Commercial-Use")?.value;
  const derivative = node.tags.find((x) => x.name === "Derivative")?.value;
  const licenseFee = node.tags.find((x) => x.name === "License-Fee")?.value;
  const currency = node.tags.find((x) => x.name === "Currency")?.value;
  const paymentMode = node.tags.find((x) => x.name === "Payment-Mode")?.value;

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
  const dateCreated = node.block?.timestamp;

  const license = {
    tx: licenseTx,
    access,
    accessFee,
    commercial,
    derivative,
    licenseFee,
    paymentMode,
    currency,
  };

  return {
    title,
    description,
    creator,
    artworkId,
    src,
    txid,
    license,
    dateCreated,
  };
};
