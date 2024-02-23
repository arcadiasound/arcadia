import { Track } from "@/types";

// Function to remove duplicates by the "value" property
export const removeDuplicatesByTxid = (arr: Track[]) => {
  const uniqueValues: string[] = [];
  const resultArray = [];

  for (const item of arr) {
    if (!uniqueValues.includes(item.txid)) {
      uniqueValues.push(item.txid);
      resultArray.push(item);
    }
  }

  return resultArray;
};

type CreatorAndTitle = Pick<Track, "creator" | "title">;

export const removeDuplicatesByCreator = (arr: Track[]) => {
  const seen = new Set<string>();
  const uniqueItems: CreatorAndTitle[] = [];

  return arr.filter((item) => {
    const key = item.creator + item.title;
    if (seen.has(key)) {
      return false; // Duplicate, filter it out
    }
    seen.add(key);
    uniqueItems.push(item);
    return true;
  });
};

export const reorderArrayByTxid = (
  tracksArray: Track[],
  txidArray: string[]
) => {
  const txidMap = new Map<string, Track>();

  // Map each txid to its corresponding object
  tracksArray.forEach((obj) => {
    txidMap.set(obj.txid, obj);
  });

  // Reorder the tracks based on the order of txids in txidArray
  const reorderedArray = txidArray
    .map((txid) => txidMap.get(txid))
    .filter((obj) => obj !== undefined) as Track[];

  return reorderedArray;
};
