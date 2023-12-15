import { appConfig } from "@/appConfig";
import { GQLQuery } from "@/types";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, {
  GetTransactionsQuery,
  SortOrder,
  Transaction,
  TransactionEdge,
} from "arweave-graphql";

export const getTrackByOwners = async (address: string, gateway?: string) => {
  console.log("address: ", address);

  try {
    const res = await gql({
      variables: {
        tags: [
          {
            name: "Content-Type",
            values: ["audio/mpeg", "audio/wav", "audio/aac", "audio/x-m4a"],
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
          {
            name: "Contract-Src",
            values: ["Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ"],
          },
        ],
      },
    });

    console.log(res);

    const data = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter((edge) => {
        const initStateTag = edge.node.tags.find(
          (x) => x.name === "Init-State"
        )?.value;

        const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

        const creator = edge.node.tags.find((x) => x.name === "Creator")?.value;

        const isOwner =
          Object.keys(initState.balances).includes(address) ||
          creator === address;

        if (isOwner) {
          return true;
        } else {
          return false;
        }
      })
      .map((edge) =>
        setTrackInfo(edge as TransactionEdge, gateway || "https://arweave.net")
      );

    const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

    return dedupedData;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};

const gql = async ({ variables }: GQLQuery): Promise<GetTransactionsQuery> => {
  const query = {
    query: `
    query {
      transactions(
        first: 50,
        tags: [
          {
            name: "Content-Type",
            values: ["audio/mpeg", "audio/wav", "audio/aac", "audio/x-m4a"],
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
        ]
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
