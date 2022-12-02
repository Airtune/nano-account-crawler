export declare type TAccount = `${'ban_' | 'nano_'}${string}`;
export declare type TNanoBlockType = "state";
export declare type TNanoBlockSubtype = "send" | "receive" | "open" | "change" | "epoch";
export declare type TStringBigInt = `${number}`;
export declare type TBlockHeight = `${number}`;
export declare type TBlockHash = string;
export declare type TPublicKey = string;
export interface INanoBlock {
    type: TNanoBlockType;
    subtype: TNanoBlockSubtype;
    account: TAccount;
    amount: TStringBigInt;
    balance: TStringBigInt;
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
    balance: TStringBigInt;
    modified_timestamp: string;
    block_count: TStringBigInt;
    account_version: string;
    confirmation_height: TStringBigInt;
    confirmation_height_frontier: TBlockHash;
}
export interface INanoAccountForwardIterable extends AsyncIterable<INanoBlock> {
}
export interface INanoAccountBackwardIterable extends AsyncIterable<INanoBlock> {
}
