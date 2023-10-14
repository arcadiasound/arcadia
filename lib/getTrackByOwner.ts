import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, { SortOrder, Transaction } from "arweave-graphql";

export const getTrackByOwners = async (address: string, gateway?: string) => {
  try {
    const res = await arweaveGql(
      `${gateway || "https://arweave.net"}/graphql`
    ).getTransactions({
      first: 100,
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
      ],
    });

    const data = res.transactions.edges
      .filter((edge) => Number(edge.node.data.size) < 1e7)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter((edge) => {
        const initStateTag = edge.node.tags.find(
          (x) => x.name === "Init-State"
        )?.value;

        console.log(initStateTag);

        const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

        const isOwner = Object.keys(initState.balances).includes(address);

        if (isOwner) {
          return true;
        } else {
          return false;
        }
      })
      .map((edge) =>
        setTrackInfo(edge.node as Transaction, gateway || "https://arweave.net")
      );

    console.log(data);

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
