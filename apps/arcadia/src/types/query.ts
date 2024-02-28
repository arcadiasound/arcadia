import { GetTransactionsQueryVariables } from "arweave-graphql";

export interface GQLQuery {
  variables: GetTransactionsQueryVariables;
}

export interface GetTrack {
  txid: string;
}

export interface GetTracks {
  txids?: string[];
  cursor?: string;
  limit?: number;
}

export interface GetTracksByOwner {
  owner: string;
  cursor?: string;
  limit?: number;
}
