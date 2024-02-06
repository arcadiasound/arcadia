import { PermissionType } from "arconnect";
import { AppInfo } from "arweave-wallet-connector";
import { ReactiveConnector } from "arweave-wallet-connector/lib/browser/Reactive";
import { GetTransactionsQueryVariables } from "arweave-graphql";
import { ArAccount } from "arweave-account";

export interface ListAssetProps {
  assetId: string;
  qty: number;
  price: number;
  address: string;
}

export interface ProfileWithOwnership {
  account: ArAccount;
  ownershipAmount: number;
}

export interface ProfileOwnershipProps {
  profileWithOwnership: ProfileWithOwnership;
  songTitle: string | undefined;
}

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
  address: string | undefined;
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

export type Track = {
  title: string | undefined;
  description?: string;
  creator: string;
  artworkId: string | undefined;
  src: string;
  txid: string;
  collectionCode?: string;
  dateCreated?: number;
  license?: License;
  cursor?: string;
};

export type Tracklist = Track[];

export type IconProps = {
  width?: number | string | undefined;
  height?: number | string | undefined;
};

export interface ArweaveWalletProps extends AppInfo {
  url?: string;
}

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

export interface ConnectProps {
  walletProvider: "arweave.app" | "arconnect";
  appName: string;
  arweaveWalletProps?: ArweaveWalletProps | undefined;
  permissions?: PermissionType[];
}

export declare const WebWallet: {
  namespaces: {
    arweaveWallet: {
      walletName: string;
      connect: () => any;
      disconnect: () => any;
      getActiveAddress: () => string | undefined;
      getActivePublicKey: () => Promise<string>;
      getAllAddresses: () => never;
      getWalletNames: () => never;
      signature: () => never;
      sign: (
        tx: import("arweave/web/lib/transaction.js").default,
        options?: any
      ) => Promise<import("arweave/web/lib/transaction.js").default>;
      dispatch: (
        tx: import("arweave/web/lib/transaction.js").default,
        options?: any
      ) => Promise<
        import(".pnpm/arweave-wallet-connector@1.0.2/node_modules/arweave-wallet-connector/lib/Arweave.js").DispatchResult
      >;
      encrypt: (data: Uint8Array, options: any) => Promise<Uint8Array>;
      decrypt: (data: Uint8Array, options: any) => Promise<Uint8Array>;
      getPermissions: () => string[];
      getArweaveConfig: () => Promise<
        Omit<import("arweave/web/lib/api.js").ApiConfig, "logger"> & {
          logger?: any;
        }
      >;
    };
  };
  postMessage(
    method: string,
    params?: any[] | undefined,
    options?:
      | import(".pnpm/arweave-wallet-connector@1.0.2/node_modules/arweave-wallet-connector/lib/types.js").PostMessageOptions
      | undefined
  ): any;
  getPublicKey(): Promise<string>;
  getArweaveConfig(): Promise<
    Omit<import("arweave/web/lib/api.js").ApiConfig, "logger"> & {
      logger?: any;
    }
  >;
  signTransaction(
    tx: import("arweave/web/lib/transaction.js").default,
    options?:
      | object
      | import(".pnpm/arweave-wallet-connector@1.0.2/node_modules/arweave-wallet-connector/lib/types.js").Null
  ): Promise<import("arweave/web/lib/transaction.js").default>;
  signDataItem(tx: {
    tags?:
      | {
          name: string;
          value: string;
        }[]
      | undefined;
    target?: string | undefined;
    data?: string | undefined;
    anchor?: string | undefined;
  }): Promise<ArrayBufferLike>;
  dispatch(
    tx: import("arweave/web/lib/transaction.js").default,
    options?:
      | object
      | import(".pnpm/arweave-wallet-connector@1.0.2/node_modules/arweave-wallet-connector/lib/types.js").Null
  ): Promise<
    import(".pnpm/arweave-wallet-connector@1.0.2/node_modules/arweave-wallet-connector/lib/Arweave.js").DispatchResult
  >;
  signMessage<T extends ArrayBufferView>(
    message: T,
    options: {
      hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
    }
  ): Promise<T>;
  verifyMessage(
    message: ArrayBufferView,
    signature: string | ArrayBufferView,
    publicKey: string,
    options: {
      hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
    } & {
      signAlgorithm?: "RSA" | undefined;
    }
  ): Promise<boolean>;
  encrypt<T_1 extends ArrayBufferView>(
    message: T_1,
    publicKey: string,
    options: AlgorithmIdentifier
  ): Promise<T_1>;
  decrypt<T_2 extends ArrayBufferView>(
    message: T_2,
    options: AlgorithmIdentifier
  ): Promise<T_2>;
  privateHash<T_3 extends ArrayBufferView>(
    message: T_3,
    options: {
      hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
    }
  ): Promise<T_3>;
  address?: string | undefined;
  connect(): any;
  disconnect(): any;
} & ReactiveConnector;
