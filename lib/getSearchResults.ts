import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, {
  GetTransactionsQuery,
  SortOrder,
  Transaction,
  TransactionEdge,
} from "arweave-graphql";
import { arweave } from "./arweave";
import { appConfig } from "@/appConfig";
import { userPreferredGateway } from "@/utils";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";

export const getSearchResults = async (
  searchValue: string,
  gateway?: string
) => {
  try {
    // get tracks
    const trackResults: GetTransactionsQuery = await getTracks(searchValue);
    console.log(trackResults);

    const data = trackResults.transactions.edges.map((edge) =>
      setTrackInfo(
        edge as TransactionEdge,
        userPreferredGateway() || appConfig.defaultGateway
      )
    );
    // get profiles

    const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

    return dedupedData;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};

const getTracks = async (searchValue: string) => {
  try {
    const response = await fetch(`${appConfig.goldskyUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildSearchQuery({
          searchValue,
          first: 5,
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
            {
              name: "Title",
              values: [searchValue],
              match: "WILDCARD",
            },
          ],
        })
      ),
    });

    const responseData = await response.json();
    console.log({ responseData });
    return responseData.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const setTrackResultInfo = (node: Transaction) => {
  const title = node.tags.find((x) => x.name === "Title")?.value;

  const artworkId =
    node.tags.find((x) => x.name === "Cover-Artwork")?.value ||
    node.tags.find((x) => x.name === "Thumbnail")?.value;

  const txid = node.id;

  return {
    title,
    artworkId,
    txid,
  };
};

const buildSearchQuery = (args: {
  searchValue: string;
  tags: {
    name: string;
    values: string[];
    match?: "EXACT" | "WILDCARD" | "FUZZY_AND" | "FUZZY_OR";
  }[];
  first: number;
}) => {
  const query = {
    query: `
			query {
				transactions(
					first: 5,
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
						  {
							name: "Contract-Src",
							values: ["Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ"],
						  },
						  {
							name: "Title",
							values: ["\`${args.searchValue}\`"],
							match: \FUZZY_OR\,
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

  return query;
};
