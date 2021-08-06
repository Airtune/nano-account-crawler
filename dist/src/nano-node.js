export class NanoNode {
    constructor(nodeApiUrl, fetch) {
        this.nodeApiUrl = nodeApiUrl;
        this.fetch = fetch;
    }
    async getForwardHistory(account, head = undefined, offset = "0", account_filter = undefined) {
        const request = {
            action: 'account_history',
            account: account,
            count: -1,
            offset: offset,
            reverse: "true",
            raw: true
        };
        if (head) {
            request.head = head;
        }
        if (account_filter) {
            request.account_filter = account_filter;
        }
        const response = await this.jsonRequest(request);
        this.validateIsAccountHistory(response);
        this.validateAccount(account, response);
        return response;
    }
    async getBackwardHistory(account, head = undefined, offset = "0", account_filter = undefined) {
        const request = {
            action: 'account_history',
            account: account,
            count: -1,
            raw: true
        };
        if (head) {
            request.head = head;
        }
        if (account_filter) {
            request.account_filter = account_filter;
        }
        const response = await this.jsonRequest(request);
        this.validateIsAccountHistory(response);
        this.validateAccount(account, response);
        return response;
    }
    async getAccountInfo(account) {
        const request = {
            action: 'account_info',
            account: account
        };
        const response = await this.jsonRequest(request);
        this.validateIsAccountInfo(response);
        return response;
    }
    hasMoreHistory(history, confirmationHeight) {
        return !this.historyIsEmpty(history) && this.historyFrontierIsBehind(history, confirmationHeight);
    }
    historyIsEmpty(history) {
        return history.length === 0 || history.length === undefined;
    }
    /////////////
    // private //
    /////////////
    async jsonRequest(jsonRequest) {
        const request = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(jsonRequest)
        };
        const response = await this.fetch(this.nodeApiUrl, request);
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    validateIsAccountHistory(accountHistory) {
        if (typeof (accountHistory) !== 'object') {
            throw Error(`UnexpectedNanoNodeResponse: Unexpected accountHistory. Expected type to be 'object', got: ${typeof (accountHistory)}`);
        }
        if (accountHistory.hasOwnProperty('error')) {
            throw Error(`NanoNodeError: ${accountHistory.error}`);
        }
        if (typeof (accountHistory.account) !== 'string') {
            throw Error(`UnexpectedNanoNodeResponse: Unexpected accountHistory.account. Expected type to be 'string', got: ${typeof (accountHistory.account)}`);
        }
        if (!accountHistory.hasOwnProperty('history')) {
            throw Error("UnexpectedNanoNodeResponse: accountHistory doesn't have property 'history'");
        }
        const _prototype = Object.prototype.toString.call(accountHistory.history);
        if (!(_prototype === '[object String]' || _prototype === '[object Array]')) {
            throw Error(`UnexpectedNanoNodeResponse: accountHistory.history not of type array or string. Got: ${_prototype}`);
        }
    }
    validateIsAccountInfo(accountInfo) {
        if (typeof (accountInfo) !== 'object') {
            throw Error(`UnexpectedNanoNodeResponse: Unexpected accountInfo. Expected type to be 'object', got: ${typeof (accountInfo)}`);
        }
        if (accountInfo.hasOwnProperty('error')) {
            throw Error(`NanoNodeError: ${accountInfo.error}`);
        }
        if (typeof (accountInfo['confirmation_height']) !== 'string') {
            throw Error(`UnexpectedNanoNodeResponse: Unexpected accountInfo['confirmation_height']. Expected type to be 'string', got: ${typeof (accountInfo['confirmation_height'])}`);
        }
    }
    validateAccount(account, accountHistory) {
        // Warning: Nano node returns history for templatePrevious block ignoring if there's an issuer account mismatch.
        if (account !== accountHistory['account']) {
            throw Error(`AccountMismatch: requested info for account '${account}' but head was for account '${accountHistory['account']}'`);
        }
    }
    ;
    historyFrontierIsBehind(history, confirmationHeight) {
        const historyLastBlock = history[history.length - 1];
        const historyHeight = BigInt('' + historyLastBlock['height']);
        return historyHeight > BigInt('0') && historyHeight < confirmationHeight;
    }
}
//# sourceMappingURL=nano-node.js.map