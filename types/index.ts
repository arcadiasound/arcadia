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
  creator: string;
  artworkId: string | undefined;
  src: string;
  txid: string;
  dateCreated?: number;
  license?: License;
};

export type Tracklist = Track[];
