import * as bananojs from '@bananocoin/bananojs';

import {
  INanoAccountForwardIterable,
  INanoBlock
} from './nano-interfaces';

import { NanoAccountForwardCrawler } from './nano-account-forward-crawler';


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
    await this._nanoAccountForwardCrawler.initialize();
  }

  [Symbol.asyncIterator](): AsyncIterator<INanoBlock> {
    const nanoAccountForwardIterator: AsyncIterator<INanoBlock> = this._nanoAccountForwardCrawler[Symbol.asyncIterator]();
    
    let expectedPrevious: string = undefined;

    return {
      next: async () => {
        const iteratorResult: IteratorResult<INanoBlock> = await nanoAccountForwardIterator.next();
        const block: INanoBlock = iteratorResult.value;
  
        // Verify block has expected value for previous
        if (typeof expectedPrevious === "string" && block.previous !== expectedPrevious) {
          throw Error(`InvalidChain: expectedPrevious: ${expectedPrevious} actual block.previous: ${block.previous} for block: ${block.hash}`);
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
          throw Error(`InvalidChain: unexpected hash: ${block.hash} calculated: ${calculatedHash}`);
        }

        // Validate work
        let hash = block.previous;
        if (hash === "0000000000000000000000000000000000000000000000000000000000000000") {
          hash = this._publicKeyHex;
        }
        const hashBytes = bananojs.bananoUtil.hexToBytes(hash);
        const workBytes = bananojs.bananoUtil.hexToBytes(block.work).reverse();
        if (!bananojs.bananoUtil.isWorkValid(hashBytes, workBytes)) {
          throw Error(`InvalidChain: unable to verify work for: ${hash} with work: ${block.work}`);
        }
  
        // Verify signature
        if (!bananojs.verify(block.hash, block.signature, this._publicKeyHex)) {
          throw Error(`InvalidChain: unable to verify signature for block: ${block.hash}`);
        }
  
        expectedPrevious = block.hash;
  
        return iteratorResult;
      }
    };
  }
}
