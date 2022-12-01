import {
  INanoAccountHistory,
  INanoAccountInfo,
  TAccount,
  TStringNumber,
  TBlockHash
} from './nano-interfaces';

export class NanoNode {
  private nodeApiUrl: string;
  private fetch: Function;

  constructor(nodeApiUrl: string, fetch: Function) {
    this.nodeApiUrl = nodeApiUrl;
    this.fetch = fetch;
  }

  async getForwardHistory(account: TAccount, head: TBlockHash = undefined, offset: TStringNumber = "0", account_filter: TAccount[] = undefined, count: number = undefined, max_retries: number = 3): Promise<INanoAccountHistory> {
    const request: any = {
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
    if (count) {
      request.count = count;
    }

    let retries: number = 0;
    let response: INanoAccountHistory = undefined;

    while (true) {
      retries += 1;

      try {
        response = await this.jsonRequest(request);
        this.validateIsAccountHistory(response);
        this.validateAccount(account, response);
        break;
      } catch (error) {
        if (retries >= max_retries || !error.message.match(/^NanoNodeError:/)) {
          throw error;
        }
      }
    } 

    return response;
  }

  async getBackwardHistory(account: TAccount, head: TBlockHash = undefined, offset: TStringNumber = "0", account_filter: TAccount[] = undefined, count: number = undefined, max_retries: number = 3): Promise<INanoAccountHistory> {
    const request: any = {
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
    if (count) {
      request.count = count;
    }

    let retries: number = 0;
    let response: INanoAccountHistory = undefined;

    while (true) {
      retries += 1;

      try {
        response = await this.jsonRequest(request);
        this.validateIsAccountHistory(response);
        this.validateAccount(account, response);
        break;
      } catch (error) {
        if (retries >= max_retries || !error.message.match(/^NanoNodeError:/)) {
          throw error;
        }
      }
    } 
    
    return response;
  }

  async getAccountInfo(account: TAccount): Promise<INanoAccountInfo> {
    const request = {
      action: 'account_info',
      account: account
    };

    let response: INanoAccountInfo;
    try {
      response = await this.jsonRequest(request);
    } catch(error) {
      throw(error);
    }
    this.validateIsAccountInfo(response);

    return response;
  }

  hasMoreHistory(history: any, confirmationHeight: BigInt): boolean {
    return !this.historyIsEmpty(history) && this.historyFrontierIsBehind(history, confirmationHeight);
  }

  historyIsEmpty(history: any): boolean {
    return history.length === 0 || history.length === undefined;
  }

  async jsonRequest(jsonRequest: any): Promise<any> {
    const request = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(jsonRequest)
    };

    let response, jsonResponse;
    response = await this.fetch(this.nodeApiUrl, request).catch((error) => { throw(error); });
    jsonResponse = await response.json().catch((error) => { throw(error); });
    return jsonResponse;
  }

  /////////////
  // private //
  /////////////

  private validateIsAccountHistory(accountHistory: INanoAccountHistory) {
    if (typeof(accountHistory) !== 'object') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountHistory. Expected type to be 'object', got: ${typeof(accountHistory)}`);
    }

    if (accountHistory.hasOwnProperty('error')) {
      throw Error(`NanoNodeError: ${accountHistory.error}`);
    }

    if (typeof(accountHistory.account) !== 'string') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountHistory.account. Expected type to be 'string', got: ${typeof(accountHistory.account)}`);
    }

    if (!accountHistory.hasOwnProperty('history')) {
      throw Error("UnexpectedNanoNodeResponse: accountHistory doesn't have property 'history'");
    }

    const _prototype: string = Object.prototype.toString.call(accountHistory.history);
    if (!(_prototype === '[object String]' || _prototype === '[object Array]')) {
      throw Error(`UnexpectedNanoNodeResponse: accountHistory.history not of type array or string. Got: ${_prototype}`);
    }
  }

  private validateIsAccountInfo(accountInfo: INanoAccountInfo) {
    if (typeof(accountInfo) !== 'object') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountInfo. Expected type to be 'object', got: ${typeof(accountInfo)}`);
    }

    if (accountInfo.hasOwnProperty('error')) {
      throw Error(`NanoNodeError: ${accountInfo.error}`);
    }

    if (typeof(accountInfo['confirmation_height']) !== 'string') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountInfo['confirmation_height']. Expected type to be 'string', got: ${typeof(accountInfo['confirmation_height'])}`);
    }
  }

  private validateAccount(account: string, accountHistory) {
    // Warning: Nano node returns history for templatePrevious block ignoring if there's an issuer account mismatch.
    if (account !== accountHistory['account']) {
      throw Error(`AccountMismatch: requested info for account '${account}' but head was for account '${accountHistory['account']}'`);
    }
  };

  private historyFrontierIsBehind(history: any, confirmationHeight: BigInt): boolean {
    const historyLastBlock = history[history.length - 1];
    const historyHeight: BigInt = BigInt('' + historyLastBlock['height']);

    return historyHeight > BigInt('0') && historyHeight < confirmationHeight
  }
}
