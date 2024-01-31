import Arweave from "arweave";
import { WarpFactory, LoggerFactory } from "warp-contracts";
import { OrderBook } from "permaweb-orderbook";

export const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export const warp = WarpFactory.forMainnet();
LoggerFactory.INST.logLevel("fatal");

export const orderbook = OrderBook.init({
  currency: "U",
  arweaveGet: null,
  arweavePost: null,
  bundlrKey: null,
  warp: warp,
  warpDreNode: "https://dre-u.warp.cc/contract",
});
