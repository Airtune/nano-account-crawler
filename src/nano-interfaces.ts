export interface INanoBlock {
  type: string;
  subtype: string;
  account: string;
  amount: string;
  representative: string;
  previous: string;
  hash: string;
  link: string;
  height: string;
}

export interface INanoAccountHistory {
  error: string;
  account: string;
  history: INanoBlock[]
}

export interface INanoAccountInfo {
  error: string;
  confirmation_height: string;
}

export interface INanoAccountForwardIterable extends AsyncIterable<INanoBlock> {}
export interface INanoAccountBackwardIterable extends AsyncIterable<INanoBlock> {}
