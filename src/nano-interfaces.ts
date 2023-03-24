import { IStatusReturn } from "./status-return-interfaces";

export type TAccount = `${'ban_' | 'nano_'}${string}`;
export type TNanoBlockType = "state";
export type TNanoBlockSubtype = "send" | "receive" | "open" | "change" | "epoch";
export type TStringBigInt = `${number}`;
export type TBlockHeight = `${number}`;
export type TBlockHash = string;
export type TPublicKey = string;

export interface INanoBlock {
  type: TNanoBlockType;
  subtype: TNanoBlockSubtype;
  account: TAccount;
  amount: TStringBigInt;
  balance: TStringBigInt;
  representative: TAccount;
  previous: string;
  hash: TBlockHash;
  link: TPublicKey;
  height: TBlockHeight;
  work: string;
  signature: string;
}

export interface INanoAccountHistory {
  error: string;
  account: TAccount;
  history: INanoBlock[]
}

export interface INanoAccountInfo {
  error: string;
  frontier: TBlockHash,
  open_block: TBlockHash,
  representative_block: TBlockHash,
  balance: TStringBigInt,
  modified_timestamp: string,
  block_count: TStringBigInt,
  account_version: string,
  confirmation_height: TStringBigInt, 
  confirmation_height_frontier: TBlockHash
}

export interface INanoAccountForwardIterable extends AsyncIterable<IStatusReturn<INanoBlock>> {}
export interface INanoAccountBackwardIterable extends AsyncIterable<IStatusReturn<INanoBlock>> {}
