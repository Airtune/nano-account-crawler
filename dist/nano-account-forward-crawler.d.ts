import { NanoNode } from './nano-node';
import { INanoAccountForwardIterable, INanoBlock, TAccount, TBlockHash, TStringBigInt } from './nano-interfaces';
export declare class NanoAccountForwardCrawler implements INanoAccountForwardIterable {
    private _nanoNode;
    private _account;
    private _head;
    private _offset;
    private _accountFilter;
    private _accountHistory;
    private _accountInfo;
    private _confirmationHeight;
    private _count;
    private _maxBlocksPerRequest;
    private _maxRpcIterations;
    constructor(nanoNode: NanoNode, account: TAccount, head?: TBlockHash, offset?: TStringBigInt, accountFilter?: TAccount[], count?: number, maxBlocksPerRequest?: number);
    initialize(): Promise<void>;
    [Symbol.asyncIterator](): AsyncIterator<INanoBlock>;
    private exceededCount;
    private reachedCount;
    get account(): string;
    get maxBlocksPerRequest(): number;
    get maxRpcIterations(): number;
    set maxRpcIterations(value: number);
}
