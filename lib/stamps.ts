import Stamps from "@permaweb/stampjs";
import { WarpFactory } from "warp-contracts";
import { InjectedArweaveSigner } from "warp-contracts-plugin-signature";
import Arweave from "arweave";
import { userStampedTx } from "./userStampedTx";

export const stamps = async () => {
  // if using ArConnect you need to make sure the following PERMISSIONS are enabled
  // * SIGNATURE
  // * ACCESS_PUBLIC_KEY
  // the new signer plugin from warp requires these settings

  // Required if you are using Warp v1.4.11 or greater
  const signer = new InjectedArweaveSigner(window.arweaveWallet);

  // also you need to make sure you set the address function
  signer.getAddress = window.arweaveWallet.getActiveAddress;

  // finally you need to setPublicKey
  await signer.setPublicKey();

  // Initialize STAMPS JS, passing a Warp and Arweave instance
  return Stamps.init({
    warp: WarpFactory.forMainnet(),
    arweave: Arweave.init({}),
    wallet: signer,
  });
};

export const stamp = async (txid: string) =>
  (await stamps()).stamp(txid, 0, [{ name: "App-Name", value: "Arcadia" }]);

export const superStamp = async (
  txid: string,
  qty: number,
  tags: { name: string; value: string }[]
) => (await stamps()).stamp(txid, qty, tags);

export const getStampCount = async (txid: string) =>
  (await stamps()).count(txid);

export const getStampCounts = async (txids: string[]) =>
  (await stamps()).counts(txids);

export const hasStamped = async (txids: string[]) =>
  (await stamps()).hasStamped(txids);

export const hasStampedTx = async (txid: string, address: string) =>
  await userStampedTx(txid, address);

export const balance = async (address: string) =>
  (await stamps()).balance(address);
