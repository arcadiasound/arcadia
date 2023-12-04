import { appConfig } from "@/appConfig";
import { GQLQuery } from "@/types";
import { GetTransactionsQuery } from "arweave-graphql";
import { arweave } from "./arweave";
// import { gql } from "./helpers";

export const getAlbum = async (txid: string) => {
  try {
    // retrieve album
    const res = await gql(txid);

    console.log({ res });

    const data = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .map((edge) => {
        const title = edge.node.tags.find((x) => x.name === "Title")?.value;
        const description = edge.node.tags.find(
          (x) => x.name === "Description"
        )?.value;
        const id = edge.node.id;
        const artworkId = edge.node.tags.find(
          (x) => x.name === "Thumbnail"
        )?.value;
        const genre = edge.node.tags.find(
          (x) => x.name === "Topic:genre"
        )?.value;
        const topics = edge.node.tags
          .filter((tag) => tag.name.includes("Topic"))
          .map((tag) => tag.value);
        let releaseType = "";

        const typeTag = edge.node.tags.find((x) => x.name === "Type")?.value;

        if (typeTag?.includes("single")) {
          releaseType = "Single";
        } else if (typeTag?.includes("ep")) {
          releaseType = "EP";
        } else if (typeTag?.includes("mixtape")) {
          releaseType = "Mixtape";
        } else if (typeTag?.includes("album")) {
          releaseType = "Album";
        } else {
          releaseType = "Album";
        }

        let creator: string;

        try {
          const creatorTag = edge.node.tags.find(
            (x) => x.name === "Creator"
          )?.value;
          // find owner from balances
          const initStateTag = edge.node.tags.find(
            (x) => x.name === "Init-State"
          )?.value;

          const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

          const assetOwner = Object.keys(initState.balances)[0];

          creator = creatorTag || assetOwner;
        } catch (error) {
          creator = edge.node.owner.address;
        }

        return {
          title,
          description,
          id,
          artworkId,
          creator,
          genre,
          topics,
          releaseType,
        };
      });

    if (!data.length) {
      throw new Error(`No collection found at id: ${txid}`);
    }

    const itemsRes = await arweave.api.get(data[0].id);
    const items: string[] = itemsRes.data.items;

    if (!items) {
      throw new Error(`Could not find items for collection at: ${txid}`);
    }

    return {
      ...data[0],
      items,
    };
  } catch (error) {
    throw error;
  }
};

const gql = async (txid: string): Promise<GetTransactionsQuery> => {
  const query = {
    query: `
    query {
      transactions(
        ids: ["${txid}"]
      ){
      edges {
        cursor
        node {
          id
          tags {
            name
            value
          }
        }
      }
    }
  }
    `,
  };

  const response = await fetch(`${appConfig.goldskyUrl}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  const resObj = await response.json();

  return resObj.data;
};
