import { INanoAccountHistory, INanoAccountInfo, TAccount, TStringBigInt, TBlockHash } from './nano-interfaces';
import { IStatusReturn } from './status-return-interfaces';
export declare class NanoNode {
    private nodeApiUrl;
    private fetch;
    constructor(nodeApiUrl: string, fetch: Function);
    getForwardHistory(account: TAccount, head?: TBlockHash, offset?: TStringBigInt, account_filter?: TAccount[], count?: number, max_retries?: number): Promise<IStatusReturn<INanoAccountHistory>>;
    getBackwardHistory(account: TAccount, head?: TBlockHash, offset?: TStringBigInt, account_filter?: TAccount[], count?: number, max_retries?: number): Promise<IStatusReturn<INanoAccountHistory>>;
    getAccountInfo(account: TAccount): Promise<IStatusReturn<INanoAccountInfo>>;
    hasMoreHistory(history: any, confirmationHeight: bigint): boolean;
    historyIsEmpty(history: any): boolean;
    jsonRequest(jsonRequest: any): Promise<IStatusReturn<any>>;
    private validateIsAccountHistory;
    private validateIsAccountInfo;
    private validateAccount;
    private historyFrontierIsBehind;
}
