import { arweave } from "./arweave";
import arweaveGql, { GetTransactionsQueryVariables } from "arweave-graphql";
import { appConfig } from "../appConfig";
import { Comment } from "../types";
import { getProfile } from "./getProfile";

export const writeComment = async ({ comment, sourceTx }: Comment) => {
  try {
    const savedTx = await arweave.createTransaction({
      data: comment,
    });
    savedTx.addTag("Content-Type", "text/plain");
    savedTx.addTag("Data-Protocol", "Comment");
    savedTx.addTag("Type", "comment");
    savedTx.addTag("Published", Date.now().toString());
    savedTx.addTag("Data-Source", sourceTx);

    const savedTxResult = await window.arweaveWallet.dispatch(savedTx);
    return savedTxResult;
  } catch (error) {
    throw new Error(error as any);
  }
};

interface CommentQueryParams {
  sourceTx: string | undefined;
  cursor?: string;
  limit?: number;
}

export const getComments = async ({
  sourceTx,
  cursor,
  limit,
}: CommentQueryParams) => {
  if (!sourceTx) {
    throw new Error("No source transaction ID found");
  }

  const query: GetTransactionsQueryVariables = {
    first: limit || 3,
    tags: [
      { name: "Content-Type", values: ["text/plain"] },
      { name: "Data-Protocol", values: ["Comment"] },
      { name: "Type", values: ["comment"] },
      { name: "Data-Source", values: [sourceTx] },
    ],
  };

  if (cursor) {
    query.after = cursor;
  }

  try {
    const metaRes = await arweaveGql(
      `${appConfig.defaultGateway}/graphql`
    ).getTransactions({
      ...query,
    });

    const metadata = metaRes.transactions.edges
      .filter((edge) => Number(edge.node.data.size) < 320)
      .filter(
        (edge) => edge.node.tags.find((x) => x.name === "Published")?.value
      )
      .map(async (edge) => {
        const owner = edge.node.owner.address;
        const txid = edge.node.id;
        const published = edge.node.tags.find(
          (x) => x.name === "Published"
        )?.value;
        // const account = await getAccount(owner);
        const cursor = edge.cursor;
        const comment = await arweave.api
          .get(txid)
          .then((res) => res.data)
          .catch((error) => console.error(error));

        return {
          owner,
          txid,
          published,
          //   account,
          comment,
          cursor,
        };
      });

    const data = await Promise.all(metadata);
    const hasNextPage = metaRes.transactions.pageInfo.hasNextPage;

    return {
      data,
      hasNextPage,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error occured whilst fetching data");
  }
};

export const getCommentCount = async (txid: string) => {
  try {
    const res = await fetch(`${appConfig.goldskyUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildSearchQuery(txid)),
    });

    const result = await res.json();
    console.log(result.data);
    return result.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const buildSearchQuery = (txid: string) => {
  const commentQuery = {
    query: `
      query {
        transactions(
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
              values: ["\`${txid}\`"],
              },
          ]
        ) {
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
        count
      }
    }
  `,
  };

  return commentQuery;
};
