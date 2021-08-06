// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountForwardCrawler {
    constructor(nanoNode, account, head = undefined, offset = undefined, accountFilter = undefined) {
        this.nanoNode = nanoNode;
        this.account = account;
        this.head = head;
        this.offset = offset;
        this.accountFilter = accountFilter;
        this.accountHistory = undefined;
        this.accountInfo = undefined;
    }
    async initialize() {
        const historySegmentPromise = this.nanoNode.getForwardHistory(this.account, this.head, this.offset, this.accountFilter);
        const accountInfoPromise = this.nanoNode.getAccountInfo(this.account);
        this.accountHistory = await historySegmentPromise;
        this.accountInfo = await accountInfoPromise;
        this.confirmationHeight = BigInt('' + this.accountInfo.confirmation_height);
    }
    firstBlock() {
        const block = this.accountHistory.history[0];
        const blockHeight = BigInt('' + block.height);
        if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
            throw Error(`NotConfirmed: first block in account history not confirmed for account: ${this.account}`);
        }
        return block;
    }
    [Symbol.asyncIterator]() {
        if (this.accountHistory === undefined || this.accountInfo === undefined || this.confirmationHeight <= BigInt('0')) {
            throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
        }
        const maxRpcIterations = 1000;
        let rpcIterations = 0;
        let history = this.accountHistory.history;
        let historyIndex = 0;
        return {
            next: async () => {
                if (history.length === 0 || historyIndex >= history.length) {
                    return { value: undefined, done: true };
                }
                const block = history[historyIndex];
                const blockHeight = BigInt('' + block.height);
                if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
                    return { value: undefined, done: true };
                }
                historyIndex += 1;
                if (historyIndex >= history.length) {
                    // If it's the last block in the history returned by the nano node but it isn't the latest
                    // confirmed block it's probably because the node didn't return the full history.
                    // In this case fetch the next segment of the history following the last block.
                    if (this.nanoNode.hasMoreHistory(history, this.confirmationHeight)) {
                        // Guard against infinite loops and making too many RPC calls.
                        rpcIterations += 1;
                        if (rpcIterations > maxRpcIterations) {
                            throw Error(`TooManyRpcIterations: Expected to fetch full history from nano node within ${maxRpcIterations} requests.`);
                        }
                        const _accountHistory = await this.nanoNode.getForwardHistory(this.account, block.hash, "1", this.accountFilter);
                        history = _accountHistory.history;
                        historyIndex = 0;
                    }
                }
                return { value: block, done: false };
            }
        };
    }
}
//# sourceMappingURL=nano-account-forward-crawler.js.map