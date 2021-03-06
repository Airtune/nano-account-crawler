import { NanoNode } from './nano-node';
import { INanoAccountForwardIterable, INanoBlock } from './nano-interfaces';
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
    private _maxRpcIterations;
    constructor(nanoNode: NanoNode, account: string, head?: string, offset?: string, accountFilter?: string[], count?: number);
    initialize(): Promise<void>;
    [Symbol.asyncIterator](): AsyncIterator<INanoBlock>;
    private exceededCount;
    private reachedCount;
    get account(): string;
    get maxRpcIterations(): number;
    set maxRpcIterations(value: number);
}
