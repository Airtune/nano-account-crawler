export type TNanoBlockType = "state";
export type TNanoBlockSubtype = "send" | "receive" | "open" | "change" | "epoch";
export interface INanoBlock {
  type: TNanoBlockType;
  subtype: TNanoBlockSubtype;
  account: string;
  amount: string;
  balance: string;
  representative: string;
  previous: string;
  hash: string;
  link: string;
  height: string;
  work: string;
  signature: string;
}

export interface INanoAccountHistory {
  error: string;
  account: string;
  history: INanoBlock[]
}

export interface INanoAccountInfo {
  error: string;
  frontier: string,
  open_block: string,
  representative_block: string,
  balance: string,
  modified_timestamp: string,
  block_count: string,
  account_version: string,
  confirmation_height: string, 
  confirmation_height_frontier: string
}

export interface INanoAccountForwardIterable extends AsyncIterable<INanoBlock> {}
export interface INanoAccountBackwardIterable extends AsyncIterable<INanoBlock> {}
