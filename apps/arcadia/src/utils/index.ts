import { appConfig } from "@/config";
import { Album, TrackOrAlbum } from "@/types";

interface AbbreviateAddressOptions {
  startChars?: number;
  endChars?: number;
  noOfEllipsis?: number;
}

interface AbbreviateAddress {
  address: string | undefined;
  options?: AbbreviateAddressOptions;
}

export const abbreviateAddress = ({ address, options = {} }: AbbreviateAddress) => {
  if (address && address.length !== 43) {
    return address;
  }

  const { startChars = 5, endChars = 4, noOfEllipsis = 2 } = options;

  const dot = ".";
  const firstFive = address?.substring(0, startChars);
  const lastFour = address?.substring(address.length - endChars);
  return `${firstFive}${dot.repeat(noOfEllipsis)}${lastFour}`;
};

export const formatTime = (time: number): string => {
  const minutes: number = Math.floor(time / 60) % 60;
  const seconds: number = Math.floor(time % 60);
  const hours: number = Math.floor(time / 3600);

  const formattedSeconds: string = `${seconds < 10 ? "0" : ""}${seconds}`;

  if (hours > 0) {
    return `${hours}:${minutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
};

export const gateway = () => {
  if (typeof window !== undefined) {
    const preferredOrDefaultGateway = localStorage.getItem("gateway") || appConfig.defaultGateway;
    return preferredOrDefaultGateway;
  } else {
    return appConfig.defaultGateway;
  }
};

export const timestampToDate = (timestamp: number | undefined) => {
  if (!timestamp) return;
  const date = new Date(timestamp * 1000).toDateString();
  return date;
};

export const timeAgo = (unixTimestamp: number | string | undefined) => {
  if (!unixTimestamp) {
    return;
  }

  const timestamp = typeof unixTimestamp === "number" ? unixTimestamp : Number(unixTimestamp);

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  const now = Date.now();

  // check if unixTimestamp is in the future
  if (timestamp > now) {
    // console.log("future time");
    console.error("The provided timestamp is in the future.");

    return;
  }

  const differenceInSeconds = Math.round(now - timestamp) / 1000;

  if (differenceInSeconds < minute) return Math.floor(differenceInSeconds) + "s";
  else if (differenceInSeconds < hour) return Math.floor(differenceInSeconds / minute) + "m";
  else if (differenceInSeconds < day) return Math.floor(differenceInSeconds / hour) + "h";
  else if (differenceInSeconds < month) return Math.floor(differenceInSeconds / day) + "d";
  else if (differenceInSeconds < year) return Math.floor(differenceInSeconds / month) + "mo";
  else return Math.floor(differenceInSeconds / year) + "y";
};

export const formatISOToCustomDate = (isoString: number) => {
  const date = new Date(isoString * 1000);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export function mapKeys(obj: Object) {
  const keys = Object.keys(obj).map((key) => {
    // console.log(key);
    return abbreviateAddress({ address: key });
  });

  // console.log(keys);
  return keys;
}

export function mapValues(obj: Object) {
  return Object.values(obj).map((value) => {
    return value;
  });
}

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};

export const fileToUint8Array = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8Array;
};

export const formatReleaseDate = (timestamp: number) => new Date(timestamp * 1000).getFullYear();

export const isAlbum = (toBeDetermined: TrackOrAlbum): toBeDetermined is Album => {
  if (toBeDetermined as Album) {
    return true;
  }
  return false;
};

export const compareArrays = (a, b) =>
  a.length === b.length && a.every((element, index) => element === b[index]);

export const compareArrayLengths = (a, b) => a.length === b.length;

export const getProcessId = (type: string) => sessionStorage.getItem(type);

export interface SetProcessId {
  type: string;
  id: string;
}

export const saveProcessId = ({ type, id }: SetProcessId) => sessionStorage.setItem(type, id);

export const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
