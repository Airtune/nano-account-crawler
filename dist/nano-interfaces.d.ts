export declare type TAccount = `${'ban_' | 'nano_'}${string}`;
export declare type TNanoBlockType = "state";
export declare type TNanoBlockSubtype = "send" | "receive" | "open" | "change" | "epoch";
export declare type TStringNumber = `${number}`;
export declare type TBlockHeight = `${number}`;
export declare type TBlockHash = string;
export declare type TPublicKey = string;
export interface INanoBlock {
    type: TNanoBlockType;
    subtype: TNanoBlockSubtype;
    account: TAccount;
    amount: TStringNumber;
    balance: TStringNumber;
    representative: string;
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
    history: INanoBlock[];
}
export interface INanoAccountInfo {
    error: string;
    frontier: TBlockHash;
    open_block: TBlockHash;
    representative_block: TBlockHash;
    balance: TStringNumber;
    modified_timestamp: string;
    block_count: TStringNumber;
    account_version: string;
    confirmation_height: TStringNumber;
    confirmation_height_frontier: TBlockHash;
}
export interface INanoAccountForwardIterable extends AsyncIterable<INanoBlock> {
}
export interface INanoAccountBackwardIterable extends AsyncIterable<INanoBlock> {
}
