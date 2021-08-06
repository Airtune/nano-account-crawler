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
    constructor(nanoNode: NanoNode, account: string, head?: string, offset?: string, accountFilter?: string[]);
    initialize(): Promise<void>;
    firstBlock(): INanoBlock;
    [Symbol.asyncIterator](): AsyncIterator<INanoBlock>;
}
