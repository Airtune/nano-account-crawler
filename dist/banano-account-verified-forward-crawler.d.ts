import { INanoAccountForwardIterable, INanoBlock } from './nano-interfaces';
import { NanoAccountForwardCrawler } from './nano-account-forward-crawler';
import { IStatusReturn } from './status-return-interfaces';
export declare class BananoAccountVerifiedForwardCrawler implements INanoAccountForwardIterable {
    private _nanoAccountForwardCrawler;
    private _publicKeyHex;
    constructor(nanoAccountForwardCrawler: NanoAccountForwardCrawler, accountToPublicKeyHex: (string: any) => string);
    initialize(): Promise<void>;
    [Symbol.asyncIterator](): AsyncIterator<IStatusReturn<INanoBlock>>;
}
