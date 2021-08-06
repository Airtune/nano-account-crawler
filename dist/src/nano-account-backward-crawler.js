// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountBackwardCrawler {
    constructor(nanoNode, account, head = undefined, accountFilter = undefined) {
        this.nanoNode = nanoNode;
        this.account = account;
        this.head = head;
        this.accountFilter = null;
        this.accountInfo = null;
        this.accountFilter = accountFilter;
    }
    async initialize() {
        const historySegmentPromise = this.nanoNode.getBackwardHistory(this.account, this.head, "0", this.accountFilter);
        const accountInfoPromise = this.nanoNode.getAccountInfo(this.account);
        this.accountHistory = await historySegmentPromise;
        this.accountInfo = await accountInfoPromise;
        this.confirmationHeight = BigInt('' + this.accountInfo.confirmation_height);
    }
    [Symbol.asyncIterator]() {
        if (this.accountHistory === null || this.accountInfo === null || this.confirmationHeight <= BigInt('0')) {
            throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
        }
        const maxRpcIterations = 1000;
        let rpcIterations = 0;
        let history = this.accountHistory.history;
        let historyIndex = undefined;
        // set historyIndex to latest confirmed block
        for (let index = 0; index < history.length; index++) {
            const block = history[index];
            const blockHeight = BigInt('' + block.height);
            if (blockHeight > BigInt('0') && blockHeight <= this.confirmationHeight) {
                historyIndex = index;
                break;
            }
        }
        return {
            next: async () => {
                if (historyIndex === undefined || history.length === 0 || historyIndex >= history.length) {
                    return { value: undefined, done: true };
                }
                const block = history[historyIndex];
                const blockHeight = BigInt('' + block.height);
                if (blockHeight <= BigInt('0')) {
                    return { value: undefined, done: true };
                }
                historyIndex += 1;
                if (historyIndex >= history.length) {
                    if (block.previous === '0000000000000000000000000000000000000000000000000000000000000000') {
                        return { value: undefined, done: true };
                    }
                    else {
                        // Guard against infinite loops and making too many RPC calls.
                        rpcIterations += 1;
                        if (rpcIterations > maxRpcIterations) {
                            throw Error(`TooManyRpcIterations: Expected to fetch full history from nano node within ${maxRpcIterations} requests.`);
                        }
                        const _accountHistory = await this.nanoNode.getBackwardHistory(this.account, block.previous, "0", this.accountFilter);
                        history = _accountHistory.history;
                        historyIndex = 0;
                    }
                }
                return { value: block, done: false };
            }
        };
    }
}
//# sourceMappingURL=nano-account-backward-crawler.js.map