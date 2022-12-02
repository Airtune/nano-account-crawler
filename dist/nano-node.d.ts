import { INanoAccountHistory, INanoAccountInfo, TAccount, TStringBigInt, TBlockHash } from './nano-interfaces';
export declare class NanoNode {
    private nodeApiUrl;
    private fetch;
    constructor(nodeApiUrl: string, fetch: Function);
    getForwardHistory(account: TAccount, head?: TBlockHash, offset?: TStringBigInt, account_filter?: TAccount[], count?: number, max_retries?: number): Promise<INanoAccountHistory>;
    getBackwardHistory(account: TAccount, head?: TBlockHash, offset?: TStringBigInt, account_filter?: TAccount[], count?: number, max_retries?: number): Promise<INanoAccountHistory>;
    getAccountInfo(account: TAccount): Promise<INanoAccountInfo>;
    hasMoreHistory(history: any, confirmationHeight: BigInt): boolean;
    historyIsEmpty(history: any): boolean;
    jsonRequest(jsonRequest: any): Promise<any>;
    private validateIsAccountHistory;
    private validateIsAccountInfo;
    private validateAccount;
    private historyFrontierIsBehind;
}
