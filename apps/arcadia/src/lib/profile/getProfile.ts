import { gql } from "../helpers/gql";
import { TransactionEdge } from "arweave-graphql";
import { GetUserProfileProps, Profile } from "@/types";
import { gateway } from "@/utils";

export const getProfile = async ({ address }: GetUserProfileProps) => {
  if (!address) {
    throw new Error("No address has been given.");
  }
  try {
    const res = await gql({
      variables: {
        owners: [address],
        tags: [
          {
            name: "Type",
            values: ["profile"],
          },
        ],
      },
    });

    const profiles = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Name")?.value)
      .map((edge) => setProfileInfo(edge as TransactionEdge));

    return profiles;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

const setProfileInfo = (edge: TransactionEdge): Profile => {
  // casting as the filter in query func is/should be ensuring value exists
  const name = edge.node.tags.find((x) => x.name === "Name")?.value as string;

  const handle = edge.node.tags.find((x) => x.name === "Handle")?.value;
  const bio = edge.node.tags.find((x) => x.name === "Bio")?.value;

  const thumbnailId = edge.node.tags.find((x) => x.name === "Thumbnail")?.value;
  const avatarId = edge.node.tags.find((x) => x.name === "Avatar")?.value;
  const bannerId = edge.node.tags.find((x) => x.name === "Banner")?.value;

  const thumbnailSrc = thumbnailId ? gateway() + "/" + thumbnailId : undefined;
  const avatarSrc = avatarId ? gateway() + "/" + avatarId : undefined;
  const bannerSrc = bannerId ? gateway() + "/" + bannerId : undefined;

  const txid = edge.node.id;
  const cursor = edge.cursor;
  const owner = edge.node.owner.address;

  return {
    txid,
    addr: owner,
    name,
    handle,
    bio,
    thumbnailSrc,
    avatarSrc,
    bannerSrc,
    cursor,
  };
};
