import Arweave from "arweave";
import { WarpFactory, LoggerFactory } from "warp-contracts";

export const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export const warp = WarpFactory.forMainnet();
LoggerFactory.INST.logLevel("fatal");
