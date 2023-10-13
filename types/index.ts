export type Track = {
  title: string | undefined;
  creator: string;
  artworkId: string | undefined;
  src: string;
  hasLicense: boolean;
  txid: string;
  accessFee: string | undefined;
};

export type Tracklist = Track[];
