import { WebIrys } from "@irys/sdk";
import { Tag } from "arweave-graphql";
import { DataItem } from "arbundles/web";
import { fileToUint8Array } from "@/utils";
import { Buffer } from "buffer";
import { UploadResponse } from "@irys/sdk/build/esm/common/types";

globalThis.Buffer = Buffer;

export const getIrys = async () => {
  const irys = new WebIrys({
    token: "arweave",
    wallet: { provider: window.arweaveWallet },
    url: "https://node2.irys.xyz",
  });

  await irys.ready();

  return irys;
};

export const uploadFile = async (data: File, tags: Tag[]) => {
  try {
    const file = await fileToUint8Array(data);

    const signed = await window.arweaveWallet.signDataItem({
      data: file,
      tags,
    });

    const dataItem = new DataItem(Buffer.from(signed));

    const res = await fetch(`https://node2.bundlr.network/tx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: dataItem.getRaw(),
    });

    const responseData: UploadResponse = await res.json();
    return responseData;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
