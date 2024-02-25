import type { SignatureOptions } from "arweave/node/lib/crypto/crypto-interface";
import type Transaction from "arweave/node/lib/transaction";
import type { Emitter } from "mitt";

/**
 * Arweave wallet declarations
 */
declare global {
  interface Window {
    /**
     * Documentation for this API is available at https://docs.arconnect.io
     */
    arweaveWallet: {
      /**
       * Name of the wallet the API was provided by.
       */
      walletName: string;

      /**
       * Semver type version of the wallet
       */
      walletVersion: string;

      /**
       * Connect to ArConnect and request permissions. This function can always be
       * called again if you want to request more permissions for your site.
       *
       * @param permissions
       * @param appInfo
       */
      connect(
        permissions: PermissionType[],
        appInfo?: AppInfo,
        gateway?: GatewayConfig
      ): Promise<void>;

      /**
       * Disconnect from ArConnect. Removes all permissions from your site.
       */
      disconnect(): Promise<void>;

      /**
       * Get the currently used wallet's address in the extension.
       *
       * @returns Promise of wallet address string
       */
      getActiveAddress(): Promise<string>;

      /**
       * Get all addresses added to the ArConnect extension
       *
       * @returns Promise of a list of the added wallets' addresses.
       */
      getAllAddresses(): Promise<string[]>;

      /**
       * Get wallet names for addresses.
       *
       * @returns Promise of an object with addresses and wallet names
       */
      getWalletNames(): Promise<{ [addr: string]: string }>;

      /**
       * Sign a transaction.
       *
       * @param transaction A valid Arweave transaction without a wallet keyfile added to it
       * @param options Arweave signing options
       *
       * @returns Promise of a signed transaction instance
       */
      sign(transaction: Transaction, options?: SignatureOptions): Promise<Transaction>;

      /**
       * Get the permissions allowed for you site by the user.
       *
       * @returns Promise of a list of permissions allowed for your dApp.
       */
      getPermissions(): Promise<PermissionType[]>;

      /**
       * Encrypt a string, using the user's wallet.
       *
       * @param data String to encrypt
       * @param options Encrypt options
       *
       * @returns Promise of the encrypted string
       */
      encrypt(
        data: string,
        options: {
          algorithm: string;
          hash: string;
          salt?: string;
        }
      ): Promise<Uint8Array>;

      /**
       * Decrypt a string encrypted with the user's wallet.
       *
       * @param data `Uint8Array` data to decrypt to a string
       * @param options Decrypt options
       *
       * @returns Promise of the decrypted string
       */
      decrypt(
        data: Uint8Array,
        options: {
          algorithm: string;
          hash: string;
          salt?: string;
        }
      ): Promise<string>;

      /**
       * Get the user's custom Arweave config set in the extension
       *
       * @returns Promise of the user's Arweave config
       */
      getArweaveConfig(): Promise<{
        host: string;
        port: number;
        protocol: "http" | "https";
      }>;

      /**
       * @deprecated Find alternatives at https://docs.arconnect.io/api/signature
       */
      signature(
        data: Uint8Array,
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign#parameters
        algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams
      ): Promise<Uint8Array>;

      /**
       * Get the user's active public key, from their wallet
       *
       * @returns Promise of the active public key
       */
      getActivePublicKey(): Promise<string>;

      /**
       * Add a token to ArConnect (if it is not already present)
       *
       * @param id Token contract ID
       * @param type Type of the token (asset or collectible)
       * @param gateway Gateway config for the token
       */
      addToken(id: string, type?: TokenType, gateway?: GatewayConfig): Promise<void>;

      /**
       * Checks if a token has been added to ArConnect
       *
       * @param id Token to check for
       *
       * @returns Token added or not
       */
      isTokenAdded(id: string): Promise<boolean>;

      /**
       * Dispatch an Arweave transaction (preferably bundled)
       *
       * @param transaction Transaction to dispatch
       *
       * @returns Dispatched transaction ID and type
       */
      dispatch(transaction: Transaction): Promise<DispatchResult>;

      /**
       * Create a deterministic secret based on the input data.
       *
       * @param data Input data to generate the hash from
       * @param options Hash configuration
       *
       * @returns Hash array
       */
      privateHash(data: ArrayBuffer, options: SignMessageOptions): Promise<Uint8Array>;

      /**
       * Create and sign a DataItem (bundled transaction item),
       * that can be loaded into "arbundles".
       *
       * @param dataItem Data item params
       *
       * @returns Buffer of the signed data item
       */
      signDataItem(dataItem: DataItem): Promise<ArrayBufferLike>;

      /**
       * Create a cryptographic signature for any piece of data for later validation.
       * This function cannot be used to sign transactions or interactions, because the data
       * gets hashed before the signature generation.
       *
       * @param data Message to be hashed and signed
       * @param options Signature options
       *
       * @returns Signature
       */
      signMessage(data: ArrayBuffer, options?: SignMessageOptions): Promise<Uint8Array>;

      /**
       * Verify a cryptographic signature created with the arweaveWallet.signMessage() function.
       *
       * @param data Data to verify with the signature
       * @param signature Signature to validate
       * @param publicKey Optionally match the signature with a different public key than the currently active
       * @param options Signature options
       *
       * @returns Validity
       */
      verifyMessage(
        data: ArrayBuffer,
        signature: ArrayBuffer | string,
        publicKey?: string,
        options?: SignMessageOptions
      ): Promise<boolean>;

      /**
       * Experimental event emitter. Allows listening to gateway config
       * updates, bundler node changes, etc.
       */
      events: Emitter<InjectedEvents>;
    };
  }
  interface WindowEventMap {
    walletSwitch: CustomEvent<{ address: string }>;
    arweaveWalletLoaded: CustomEvent<{}>;
  }
}

/**
 * Arweave wallet permission types
 */
export type PermissionType =
  | "ACCESS_ADDRESS"
  | "ACCESS_PUBLIC_KEY"
  | "ACCESS_ALL_ADDRESSES"
  | "SIGN_TRANSACTION"
  | "ENCRYPT"
  | "DECRYPT"
  | "SIGNATURE"
  | "ACCESS_ARWEAVE_CONFIG"
  | "DISPATCH";

export interface DispatchResult {
  id: string;
  type?: "BASE" | "BUNDLED";
}

export interface AppInfo {
  name?: string;
  logo?: string;
}

export interface GatewayConfig {
  host: string;
  port: number;
  protocol: "http" | "https";
}

/**
 * Available injected event types
 */
export interface InjectedEvents {
  connect: null;
  disconnect: null;
  activeAddress: string;
  addresses: string[];
  permissions: PermissionType[];
  gateway: Gateway;
}

export type TokenType = "asset" | "collectible";

export interface SignMessageOptions {
  hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512";
}

export interface DataItem {
  data: string | Uint8Array;
  target?: string;
  anchor?: string;
  tags?: {
    name: string;
    value: string;
  }[];
}

export {};
