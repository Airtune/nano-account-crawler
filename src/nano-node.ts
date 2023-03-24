import {
  INanoAccountHistory,
  INanoAccountInfo,
  TAccount,
  TStringBigInt,
  TBlockHash
} from './nano-interfaces';
import { IErrorReturn, IStatusReturn } from './status-return-interfaces';

export class NanoNode {
  private nodeApiUrl: string;
  private fetch: Function;

  constructor(nodeApiUrl: string, fetch: Function) { 
    this.nodeApiUrl = nodeApiUrl;
    this.fetch = fetch;
  }

  async getForwardHistory(account: TAccount, head: TBlockHash = undefined, offset: TStringBigInt = "0", account_filter: TAccount[] = undefined, count: number = undefined, max_retries: number = 3): Promise<IStatusReturn<INanoAccountHistory>> {
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
    let errorResponse: IErrorReturn = undefined;
  
    while (retries < max_retries) {
      retries += 1;
  
      try {
        const responseStatus: IStatusReturn<any> = await this.jsonRequest(request);
        if (responseStatus.status === "error") {
          errorResponse = responseStatus;
          continue;
        }
        response = responseStatus.value;
        const isAccountHistoryValid: IStatusReturn<void> = await this.validateIsAccountHistory(account, response);
        const isAccountValid: IStatusReturn<void> = await this.validateAccount(account, response);
        if (isAccountHistoryValid.status === "error") {
          errorResponse = isAccountHistoryValid;
          continue;
        }
        if (isAccountValid.status === "error") {
          errorResponse = isAccountValid;
          continue;
        }
        errorResponse = undefined;
        break;
      } catch (error) {
        errorResponse = {
          status: "error",
          error_type: "UnexpectedError",
          message: `Unexpected error occurred while getting forward history: ${error}`
        };
        continue;
      }
    } 
  
    if (!response) {
      errorResponse = {
        status: "error",
        error_type: "MissingNanoNodeResponse",
        message: "NanoNode response is missing after getting forward history"
      };
    }
  
    if (errorResponse) {
      return errorResponse;
    }
  
    return {
      status: "ok",
      value: response
    };
  }
  

  async getBackwardHistory(account: TAccount, head: TBlockHash = undefined, offset: TStringBigInt = "0", account_filter: TAccount[] = undefined, count: number = undefined, max_retries: number = 3): Promise<IStatusReturn<INanoAccountHistory>> {
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
    let errorResponse: IErrorReturn = undefined;
  
    while (retries < max_retries) {
      retries += 1;
  
      try {
        const responseStatus: IStatusReturn<any> = await this.jsonRequest(request);
        if (responseStatus.status === "error") {
          errorResponse = responseStatus;
          continue;
        }
        response = responseStatus.value;
        const isAccountHistoryValid = await this.validateIsAccountHistory(account, response);
        const isAccountValid = await this.validateAccount(account, response);
        if (isAccountHistoryValid.status === "error") {
          errorResponse = isAccountHistoryValid;
          continue;
        }
        if (isAccountValid.status === "error") {
          errorResponse = isAccountValid;
          continue;
        }
        errorResponse = undefined;
        break;
      } catch (error) {
        errorResponse = {
          status: "error",
          error_type: "UnexpectedError",
          message: `Unexpected error occurred while getting backward history: ${error}`
        };
        continue;
      }
    } 
  
    if (!response) {
      errorResponse = {
        status: "error",
        error_type: "MissingNanoNodeResponse",
        message: "NanoNode response is missing after getting backward history"
      };
    }
  
    if (errorResponse) {
      return errorResponse;
    }
  
    return {
      status: "ok",
      value: response
    };
  }
  

  async getAccountInfo(account: TAccount): Promise<IStatusReturn<INanoAccountInfo>> {
    const request = {
      action: 'account_info',
      account: account
    };
  
    let response: INanoAccountInfo;
    try {
      const responseStatus: IStatusReturn<any> = await this.jsonRequest(request);
        if (responseStatus.status === "error") {
          return responseStatus;
        }
        response = responseStatus.value;
      const isAccountValid = await this.validateIsAccountInfo(account, response);
      if (isAccountValid.status === "error") {
        return isAccountValid;
      }
    } catch (error) {
      return {
        status: "error",
        error_type: "UnexpectedError",
        message: `Unexpected error occurred while getting account info: ${error}`
      };
    }
  
    if (!response) {
      return {
        status: "error",
        error_type: "MissingNanoNodeResponse",
        message: "NanoNode response is missing after getting account info"
      };
    }
  
    return {
      status: "ok",
      value: response
    };
  }
  

  hasMoreHistory(history: any, confirmationHeight: bigint): boolean {
    return !this.historyIsEmpty(history) && this.historyFrontierIsBehind(history, confirmationHeight);
  }

  historyIsEmpty(history: any): boolean {
    return history.length === 0 || history.length === undefined;
  }

  async jsonRequest(jsonRequest: any): Promise<IStatusReturn<any>> {
    const request = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: undefined
    };
  
    let response, jsonResponse;
    try {
      request.body = JSON.stringify(jsonRequest);
    } catch (error) {
      return {
        status: "error",
        error_type: "JsonStringifyError",
        message: `Error occurred while converting JSON request to string: ${error}`
      };
    }
  
    try {
      response = await this.fetch(this.nodeApiUrl, request);
      jsonResponse = await response.json();
    } catch (error) {
      return {
        status: "error",
        error_type: "UnexpectedError",
        message: `Unexpected error occurred while making JSON request: ${error}`
      };
    }
  
    if (!jsonResponse) {
      return {
        status: "error",
        error_type: "MissingJsonResponse",
        message: "JSON response is missing after making JSON request"
      };
    }
  
    return {
      status: "ok",
      value: jsonResponse
    };
  }
  

  /////////////
  // private //
  /////////////

  private validateIsAccountHistory(account: TAccount, accountHistory: INanoAccountHistory): IStatusReturn<void> {
    if (typeof(accountHistory) !== 'object') {
      return {
        status: "error",
        error_type: "UnexpectedNanoNodeResponse",
        message: `Unexpected accountHistory. Expected type to be 'object', got: ${typeof(accountHistory)} for ${account}`
      };
    }
  
    if (accountHistory.hasOwnProperty('error')) {
      return {
        status: "error",
        error_type: "NanoNodeError",
        message: `${accountHistory.error} for ${account}`
      };
    }
  
    if (typeof(accountHistory.account) !== 'string') {
      return {
        status: "error",
        error_type: "UnexpectedNanoNodeResponse",
        message: `Unexpected accountHistory.account. Expected type to be 'string', got: ${typeof(accountHistory.account)} for ${account}`
      };
    }
  
    if (!accountHistory.hasOwnProperty('history')) {
      return {
        status: "error",
        error_type: "UnexpectedNanoNodeResponse",
        message: `accountHistory doesn't have property 'history' for ${account}`
      };
    }
  
    const _prototype: string = Object.prototype.toString.call(accountHistory.history);
    if (!(_prototype === '[object String]' || _prototype === '[object Array]')) {
      return {
        status: "error",
        error_type: "UnexpectedNanoNodeResponse",
        message: `accountHistory.history not of type array or string. Got: ${_prototype} for ${account}`
      };
    }
  
    return { status: "ok" };
  }
  

  private validateIsAccountInfo(account: TAccount, accountInfo: INanoAccountInfo): IStatusReturn<void> {
    if (typeof(accountInfo) !== 'object') {
      return {
        status: "error",
        error_type: "UnexpectedNanoNodeResponse",
        message: `Unexpected accountInfo. Expected type to be 'object', got: '${typeof(accountInfo)}' for ${account}`
      };
    }

    if (accountInfo.hasOwnProperty('error')) {
      return {
        status: "error",
        error_type: "NanoNodeError",
        message: `${accountInfo.error} for ${account}`
      };
    }

    if (typeof(accountInfo['confirmation_height']) !== 'string') {
      return {
        status: "error",
        error_type: "UnexpectedNanoNodeResponse",
        message: `Unexpected accountInfo['confirmation_height']. Expected type to be 'string', got: ${typeof(accountInfo['confirmation_height'])} for ${account}`
      };
    }

    return { status: "ok" };
  }

  private validateAccount(account: string, accountHistory): IStatusReturn<void> {
    // Warning: Nano node returns history for templatePrevious block ignoring if there's an issuer account mismatch.
    if (account !== accountHistory['account']) {
      return {
        status: "error",
        error_type: "AccountMismatch",
        message: `requested info for account '${account}' but head was for account '${accountHistory['account']}'`
      };
    }

    return { status: "ok" };
  };

  private historyFrontierIsBehind(history: any, confirmationHeight: bigint): boolean {
    const historyLastBlock = history[history.length - 1];
    const historyHeight: bigint = BigInt('' + historyLastBlock['height']);

    return historyHeight > BigInt('0') && historyHeight < confirmationHeight
  }
}
