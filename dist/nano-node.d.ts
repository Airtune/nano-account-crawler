import { INanoAccountHistory, INanoAccountInfo } from './nano-interfaces';
export declare class NanoNode {
    private nodeApiUrl;
    private fetch;
    constructor(nodeApiUrl: string, fetch: Function);
    getForwardHistory(account: string, head?: string, offset?: string, account_filter?: string[]): Promise<INanoAccountHistory>;
    getBackwardHistory(account: string, head?: string, offset?: string, account_filter?: string[]): Promise<INanoAccountHistory>;
    getAccountInfo(account: any): Promise<INanoAccountInfo>;
    hasMoreHistory(history: any, confirmationHeight: BigInt): boolean;
    historyIsEmpty(history: any): boolean;
    jsonRequest(jsonRequest: any): Promise<any>;
    private validateIsAccountHistory;
    private validateIsAccountInfo;
    private validateAccount;
    private historyFrontierIsBehind;
}
