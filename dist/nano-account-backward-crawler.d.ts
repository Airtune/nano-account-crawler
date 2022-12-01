import { NanoNode } from './nano-node';
import { INanoAccountBackwardIterable, INanoBlock, TAccount, TBlockHash } from './nano-interfaces';
export declare class NanoAccountBackwardCrawler implements INanoAccountBackwardIterable {
    nanoNode: NanoNode;
    account: TAccount;
    head: TBlockHash;
    accountFilter: TAccount[];
    private accountHistory;
    private accountInfo;
    private confirmationHeight;
    private count;
    private _maxBlocksPerRequest;
    private _maxRpcIterations;
    constructor(nanoNode: NanoNode, account: TAccount, head?: string, accountFilter?: TAccount[], count?: number, maxBlocksPerRequest?: number);
    initialize(): Promise<void>;
    [Symbol.asyncIterator](): AsyncIterator<INanoBlock>;
    private reachedCount;
    get maxBlocksPerRequest(): number;
    get maxRpcIterations(): number;
    set maxRpcIterations(value: number);
}
