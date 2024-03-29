import * as bananojsImport from '@bananocoin/bananojs';
const bananojs = bananojsImport as any;

import {
  INanoAccountForwardIterable,
  INanoBlock
} from './nano-interfaces';

import { NanoAccountForwardCrawler } from './nano-account-forward-crawler';
import { IStatusReturn } from './status-return-interfaces';


// Iterable that makes requests as required when looping through blocks in an account.
export class BananoAccountVerifiedForwardCrawler implements INanoAccountForwardIterable {
  private _nanoAccountForwardCrawler: NanoAccountForwardCrawler;
  private _publicKeyHex: string;

  constructor(nanoAccountForwardCrawler: NanoAccountForwardCrawler, accountToPublicKeyHex: (string) => string) {
    const account: string = nanoAccountForwardCrawler.account;
    this._publicKeyHex = accountToPublicKeyHex(account);
    this._nanoAccountForwardCrawler = nanoAccountForwardCrawler;
  }

  async initialize() {
    try {
      await this._nanoAccountForwardCrawler.initialize();
    } catch(error) {
      throw(error);
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<IStatusReturn<INanoBlock>> {
    const nanoAccountForwardIterator: AsyncIterator<IStatusReturn<INanoBlock>> = this._nanoAccountForwardCrawler[Symbol.asyncIterator]();

    let expectedPrevious: string = undefined;

    return {
      next: async (): Promise<IteratorResult<IStatusReturn<INanoBlock>>> => {
        let iteratorResult: IteratorResult<IStatusReturn<INanoBlock>>;
        try {
          iteratorResult = await nanoAccountForwardIterator.next();
        } catch(error) {
          throw(error);
        }

        const blockStatusReturn: IStatusReturn<INanoBlock> = iteratorResult.value;
        if (blockStatusReturn.status === "error") {
          return { value: blockStatusReturn, done: true };
        }
        
        const block = blockStatusReturn.value;
        if (!block) {
          return { value: { status: "error", error_type: "MissingBlock", message: `expected block, got nothing` }, done: true };
        }

        if (iteratorResult.done) {
          return { value: { status: "ok", data: undefined }, done: true };
        }

        // Verify block has expected value for previous
        if (typeof expectedPrevious === "string" && block.previous !== expectedPrevious) {
          return { value: { status: "error", error_type: "InvalidChain", message: `expectedPrevious: ${expectedPrevious} actual block.previous: ${block.previous} for block: ${block.hash}` }, done: true };
        }

        // Verify block hash
        const tempBlock = {
          account: this._nanoAccountForwardCrawler.account,
          previous: block.previous,
          representative: block.representative,
          balance: block.balance,
          link: block.link
        }
        const calculatedHash = bananojs.getBlockHash(tempBlock);
        if (calculatedHash !== block.hash) {
          return { value: { status: "error", error_type: "InvalidChain", message: `unexpected hash: ${block.hash} calculated: ${calculatedHash}` }, done: true };
        }

        // Validate work
        let hash = block.previous;
        if (hash === "0000000000000000000000000000000000000000000000000000000000000000") {
          hash = this._publicKeyHex;
        }
        const hashBytes = bananojs.bananoUtil.hexToBytes(hash);
        const workBytes = bananojs.bananoUtil.hexToBytes(block.work).reverse();
        if (!bananojs.bananoUtil.isWorkValid(hashBytes, workBytes)) {
          return { value: { status: "error", error_type: "InvalidChain", message: `unable to verify work for: ${hash} with work: ${block.work}` }, done: true };
        }

        // Verify signature
        if (!bananojs.verify(block.hash, block.signature, this._publicKeyHex)) {
          return { value: { status: "error", error_type: "InvalidChain", message: `unable to verify signature for block: ${block.hash}` }, done: true };
        }

        expectedPrevious = block.hash;

        return iteratorResult;
      }
    };
  }

}
