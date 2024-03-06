import { GetTransactionsQueryVariables, Tag } from "arweave-graphql";

export interface DialogOpenProps {
  // name is for if we have multiple dialogs inside dropdown
  name?: "share";
  open: boolean;
}

export interface GetUserProfileProps {
  address: string | undefined;
}

export interface SetProfile {
  name: string;
  handle: string;
  bio: string;
  avatar: File | undefined;
  banner: File | undefined;
}

export interface Profile {
  txid: string;
  addr: string;
  name: string;
  handle: string | undefined;
  thumbnailSrc: string | undefined;
  avatarId: string | undefined;
  bannerId: string | undefined;
  bio: string | undefined;
  links?: {
    [link: string]: string;
  };
  cursor: string;
}

export interface CancelOrderProps {
  orderId: string;
  address: string;
}

export interface BuyAssetProps {
  assetId: string;
  spend: number;
  address: string;
}

export interface ListAssetProps {
  assetId: string;
  qty: number;
  price: number;
  address: string;
}

// export interface ProfileWithOwnership {
//   account: ArAccount;
//   ownershipAmount: number;
// }

// export interface ProfileOwnershipProps {
//   profileWithOwnership: ProfileWithOwnership;
//   songTitle: string | undefined;
// }

interface UCMAssetState {
  balances: {
    [address: string]: number;
  };
  claimable: [];
  creator: string;
  description?: string;
  name: string;
  ticker: string;
}

export interface UCMAssetProps {
  contractTxid: string;
  errorMessages: {};
  signature: string;
  sortKey: string;
  state: UCMAssetState;
  validityCount: number;
}

export interface UCMAssetProps {
  contractTxid: string;
  errorMessages: {};
  signature: string;
  sortKey: string;
  state: UCMAssetState;
  validityCount: number;
}

interface PriceData {
  vwap: number;
  block: string;
  matchLogs: { id: string; quantity: number; price: number }[];
  dominantToken: string;
}

export interface SaleOrder {
  id: string;
  price: number;
  token: string;
  creator: string;
  quantity: number;
  transfer: string;
  originalQuantity: number;
}

export interface AssetPair {
  pair: string[];
  orders: SaleOrder[];
  priceData?: PriceData;
}

export interface UCMContract extends UCMAssetProps {
  state: UCMAssetState & {
    pairs: AssetPair[];
    streaks: {
      [address: string]: {
        days: number;
        lastHeight: number;
      };
    };
    divisibility: number;
    recentRewards: {
      [address: string]: number;
    };
  };
}

interface AssetPaging {
  limit: number;
  items: number;
  page: number;
}

interface AssetBalance {
  contract_tx_id: string;
  token_ticker: string;
  token_name: string;
  balance: string;
  sort_key: string;
}

export interface AssetCollectionResponse {
  paging: AssetPaging;
  balances: AssetBalance[];
}

export interface GQLQuery {
  variables: GetTransactionsQueryVariables;
  gateway?: string;
}

export interface Comment {
  comment: string;
  sourceTx: string;
}

export type License = {
  tx: string | undefined;
  access: string | undefined;
  accessFee: string | undefined;
  commercial: string | undefined;
  derivative: string | undefined;
  licenseFee: string | undefined;
  paymentMode: string | undefined;
  currency: string | undefined;
};

export interface TrackAssetOwner {
  address: string;
  ownershipAmount: number;
}

export type ReleaseType = "single" | "album";

export type TrackOrAlbum = Track | Album;

export type Track = {
  title: string;
  owner: string;
  creator: string;
  audioSrc: string;
  thumbnailSrc: string;
  artworkSrc: string;
  txid: string;
  releaseDate: number | undefined;
  releaseType: ReleaseType;
  cursor: string;
  topics?: string[];
};

export type Album = {
  txid: string;
  title: string;
  creator: string;
  thumbnailSrc: string;
  artworkSrc: string;
  trackIds: string[];
  releaseDate: number | undefined;
  releaseType: ReleaseType;
  cursor: string;
};

export type Tracklist = Track[];

export type IconProps = {
  width?: number | string | undefined;
  height?: number | string | undefined;
};

export interface PermaProfile {
  address: string;
  handle: string | undefined;
  uniqueHandle: string | undefined;
  bio: string | undefined;
  avatar: string | undefined;
  banner: string | undefined;
  // vouched: boolean;
}

export type ArweaveConfig = {
  host: string;
  port: number;
  protocol: string;
};

export type Vouched = boolean;

export type Env = {
  gateway?: string;
  // maybe add some cache options here
};

// Interfaces for aoconnect
export interface SpawnProcessParams {
  moduleTxId?: string;
  scheduler?: string;
  tags?: Tag[];
}

export interface SendMessageParams {
  processId: string;
  action: string;
  data?: string;
  tags?: Tag[];
}

export interface MessageResult {
  Messages: any[]; // Replace 'any' with the specific message type from aoconnect
  Spawns: any[]; // Replace 'any' with the specific spawn type from aoconnect
  Output: string;
  Error?: string;
}

export interface ReadResultParams {
  messageId: string;
  processId: string;
}
