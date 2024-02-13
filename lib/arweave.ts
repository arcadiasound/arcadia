import Arweave from "arweave";
import { WarpFactory, LoggerFactory } from "warp-contracts";
import { OrderBook } from "permaweb-orderbook";
import { InjectedArweaveSigner } from "warp-contracts-plugin-signature";

export const arweave = Arweave.init({});

export const warp = WarpFactory.forMainnet();
LoggerFactory.INST.logLevel("fatal");

export const initSigner = async () => {
  const permissions = await window.arweaveWallet.getPermissions();

  if (permissions.includes("ACCESS_PUBLIC_KEY")) {
    const signer = new InjectedArweaveSigner(window.arweaveWallet);
    signer.getAddress = window.arweaveWallet.getActiveAddress;

    await signer.setPublicKey();

    return signer;
  } else {
    await window.arweaveWallet.connect(["ACCESS_PUBLIC_KEY"]);

    const signer = new InjectedArweaveSigner(window.arweaveWallet);
    signer.getAddress = window.arweaveWallet.getActiveAddress;

    await signer.setPublicKey();

    return signer;
  }
};

export const orderbook = OrderBook.init({
  currency: "U",
  arweaveGet: arweave,
  arweavePost: arweave,
  bundlrKey: null,
  warp: warp,
  warpDreNode: "https://dre-u.warp.cc/contract",
});
