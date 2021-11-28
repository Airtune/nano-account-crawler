import { NanoNode } from './nano-node';
import { INanoAccountForwardIterable, INanoBlock } from './nano-interfaces';
export declare class NanoAccountForwardCrawler implements INanoAccountForwardIterable {
    private nanoNode;
    private account;
    private head;
    private offset;
    private accountFilter;
    private accountHistory;
    private accountInfo;
    private confirmationHeight;
    private count;
    constructor(nanoNode: NanoNode, account: string, head?: string, offset?: string, accountFilter?: string[], count?: number);
    initialize(): Promise<void>;
    [Symbol.asyncIterator](): AsyncIterator<INanoBlock>;
    private reachedCount;
}
