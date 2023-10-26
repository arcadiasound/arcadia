import { appConfig } from "@/appConfig";
import { Transaction, TransactionEdge } from "arweave-graphql";

interface RecentActivityResults {
  timestamp: number;
  owner: string;
  txid: string;
  type: "liked" | "commented";
}

export const getRecentActivity = async (txid: string) => {
  try {
    const res = await fetch(`${appConfig.defaultGateway}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildSearchQuery(txid)),
    });

    const result = await res.json();

    const recentComments: TransactionEdge[] = result.data.recentComments.edges;
    const recentStamps: TransactionEdge[] = result.data.recentStamps.edges;

    const combinedResults = [...recentComments, ...recentStamps]
      .filter((edge) => edge.node.block)
      .map((edge) => fillterResults(edge.node));

    // console.log({ combinedResults });

    const sortedResults = combinedResults.sort((a, b) => {
      const timestampA = a.timestamp;
      const timestampB = b.timestamp;

      return timestampB - timestampA;
    });

    console.log({ sortedResults });

    return sortedResults;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const fillterResults = (node: Transaction): RecentActivityResults => {
  let activityType: RecentActivityResults["type"];

  const isStamp =
    node.tags.find((x) => x.name === "Protocol-Name")?.value === "Stamp";

  if (isStamp) {
    activityType = "liked";
  }

  const isComment =
    node.tags.find((x) => x.name === "Data-Protocol")?.value === "Comment";

  if (isComment) {
    activityType = "commented";
  }

  return {
    timestamp: node.block!!.timestamp,
    owner: node.owner.address,
    txid: node.id,
    //@ts-ignore
    type: activityType,
  };
};

const buildSearchQuery = (txid: string) => {
  const recentActivityQuery = {
    query: `
    query {
      recentComments: transactions(
        first: 3,
        tags: [
          {
            name: "Content-Type",
            values: ["text/plain"],
            },
            {
            name: "Data-Protocol",
            values: ["Comment"],
            },
            {
              name: "Data-Source",
              values: ["${txid}"],
              },
        ]
      ) {
        edges {
          cursor
          node {
            id
            block {
              timestamp
            }
            owner {
              address
            }
            tags {
              name 
              value 
            }
          }
        }
    }
    recentStamps: transactions(
      first: 3,
      tags: [
          {
          name: "Protocol-Name",
          values: ["Stamp"],
          },
          {
          name: "Data-Source",
          values: ["${txid}"],
          },
      ]
    ) {
      edges {
        cursor
        node {
          id
          block {
            timestamp
          }
          owner {
            address
          }
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

  return recentActivityQuery;
};
