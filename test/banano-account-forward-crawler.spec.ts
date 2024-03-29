import * as bananojsImport from '@bananocoin/bananojs';
const bananojs = bananojsImport as any;

import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from '../src/nano-node';
import { NanoAccountForwardCrawler } from '../src/nano-account-forward-crawler';
import { TAccount, TBlockHash } from '../src/nano-interfaces';

const bananode = new NanoNode('http://145.239.223.42:7072', fetch);
const account: TAccount = 'ban_1iw8sa3o57s6iso15hhzrs8todje1c3c5fcjwmneab7nz1o6d781cxxtddaf';
const previous: TBlockHash = '2DA1AE13457652BC5136DF83E05CB959A6EF5BCAED83E64978FD2B2D8080020A';

describe('NanoAccountForwardCrawler using Banano Honey API', function() {
  this.timeout(20000);

  it('has a valid chain using for await iterator on NanoAccountForwardCrawler', async () => {
    const banCrawler = new NanoAccountForwardCrawler(bananode, account, previous, '1', undefined, 100);
    try {
      await banCrawler.initialize();

      let expectedPrevious = previous;
      for await (const blockStatusReturn of banCrawler) {
        if (blockStatusReturn.status === "error") {
          throw `Got error of type ${blockStatusReturn.error_type} with message: ${blockStatusReturn.message}`;
        }
        const block = blockStatusReturn.value;
        if (!block) {
          throw `Unexpected blank block for blockStatusReturn`;
        }
        expect(block.previous).to.equal(expectedPrevious);
        expectedPrevious = block.hash;
      }
    } catch(error) {
      throw(error);
    }
  });

  it('works with a 1 block count limit on NanoAccountForwardCrawler', async () => {
    try {
      await countTest(1);
    } catch(error) {
      throw(error);
    }
  });

  it('works with a 3 block count limit on NanoAccountForwardCrawler', async () => {
    try {
      await countTest(3);
    } catch(error) {
      throw(error);
    }
  });

  it('can crawl forward with account filter', async () => {
    let selection: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let account: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let _head: TBlockHash = "201D206790E46B4CB24CA9F0DB370F8F4BA2E905D66E8DE825D36A9D0E775DAB";
    let count = 8;
    const banCrawler = new NanoAccountForwardCrawler(bananode, account, _head, undefined, [selection], count);

    let blockCount;
    try {
      await banCrawler.initialize();

      blockCount = 0;
      for await (const blockStatusReturn of banCrawler) {
        if (blockStatusReturn.status === "error") {
          throw `Got error of type ${blockStatusReturn.error_type} with message: ${blockStatusReturn.message}`;
        }
        const block = blockStatusReturn.value;
        if (!block) {
          throw `Unexpected blank block for blockStatusReturn`;
        }
        blockCount += 1;
      }
    } catch(error) {
      throw(error);
    }
    
    expect(blockCount).to.equal(6);
  });
});

async function countTest(expectedCount) {
  const banCrawler = new NanoAccountForwardCrawler(bananode, account, previous, '1', undefined, expectedCount);
    let expectedPrevious, count;

    try {
      await banCrawler.initialize();

      expectedPrevious = previous;
      count = 0;
      for await (const blockStatusReturn of banCrawler) {
        if (blockStatusReturn.status === "error") {
          throw `Got error of type ${blockStatusReturn.error_type} with message: ${blockStatusReturn.message}`;
        }
        const block = blockStatusReturn.value;
        if (!block) {
          throw `Unexpected blank block for blockStatusReturn`;
        }
        count = count + 1;
        expect(block.previous).to.equal(expectedPrevious);
        expectedPrevious = block.hash;
      }
    } catch(error) {
      throw(error);
    }
    expect(count).to.equal(expectedCount);
}
