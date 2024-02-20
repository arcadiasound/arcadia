import arweaveGql, { Transaction } from "arweave-graphql";
import { Env, PermaProfile } from "../../types";
import { appConfig } from "../../appConfig";
// import { isVouched } from 'vouchdao';

export const getAccount = async (address: string, env: Env) => {
  try {
    const res = await arweaveGql(
      `${env.gateway || appConfig.defaultGateway}/graphql`
    ).getTransactions({
      owners: [address],
      tags: [
        { name: "Content-Type", values: ["application/json"] },
        { name: "Protocol", values: ["PermaProfile-v0.1"] },
      ],
    });
    const data = res.transactions.edges.map((edge) =>
      transform(edge.node as Transaction)
    );

    const profileRes = await Promise.all(data);
    return profileRes[0];
  } catch (error) {
    console.error(error);
    throw new Error("Error occured whilst fetching data");
  }
};

const transform = async (node: Transaction): Promise<PermaProfile> => {
  const address = node.owner.address;
  const handle = node.tags.find((x) => x.name === "Profile-Name")?.value;
  const uniqueHandle =
    handle && handle + `#${address.slice(0, 3)}` + address.slice(40, 43);
  const bio = node.tags.find((x) => x.name === "Profile-Bio")?.value;
  const avatar = node.tags.find((x) => x.name === "Profile-Avatar")?.value;
  const banner = node.tags.find((x) => x.name === "Profile-Background")?.value;
  // const vouched = await isVouched(address);

  return {
    address,
    handle,
    uniqueHandle,
    bio,
    avatar,
    banner,
    // vouched,
  };
};
