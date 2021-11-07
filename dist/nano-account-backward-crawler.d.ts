import { NanoNode } from './nano-node';
import { INanoAccountBackwardIterable, INanoBlock } from './nano-interfaces';
export declare class NanoAccountBackwardCrawler implements INanoAccountBackwardIterable {
    nanoNode: NanoNode;
    account: string;
    head: string;
    accountFilter: string[];
    private accountHistory;
    private accountInfo;
    private confirmationHeight;
    private count;
    constructor(nanoNode: NanoNode, account: string, head?: string, accountFilter?: string[], count?: number);
    initialize(): Promise<void>;
    [Symbol.asyncIterator](): AsyncIterator<INanoBlock>;
    private reachedCount;
}
