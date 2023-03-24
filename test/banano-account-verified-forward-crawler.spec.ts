import * as bananojsImport from '@bananocoin/bananojs';
const bananojs = bananojsImport as any;

import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from '../src/nano-node';
import { NanoAccountForwardCrawler } from '../src/nano-account-forward-crawler';
import { BananoAccountVerifiedForwardCrawler } from '../src/banano-account-verified-forward-crawler';

const bananode = new NanoNode('http://145.239.223.42:7072', fetch);
const account = 'ban_1iw8sa3o57s6iso15hhzrs8todje1c3c5fcjwmneab7nz1o6d781cxxtddaf';
const previous = '2DA1AE13457652BC5136DF83E05CB959A6EF5BCAED83E64978FD2B2D8080020A';

describe('BananoAccountVerifiedForwardCrawler using Banano Honey API', function() {
  this.timeout(20000);

  it('has a valid chain using for await iterator on BananoAccountVerifiedForwardCrawler', async () => {
    const _banCrawler = new NanoAccountForwardCrawler(bananode, account, previous, '1', undefined, 100);
    const banCrawler = new BananoAccountVerifiedForwardCrawler(_banCrawler, bananojs.getAccountPublicKey);
    await banCrawler.initialize().catch((error) => { throw(error); });

    let expectedPrevious = previous;
    try {
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

  it('works with a 1 block count limit on BananoAccountVerifiedForwardCrawler', async () => {
    await countTest(1).catch((error) => { throw(error); });
  });

  it('works with a 3 block count limit on BananoAccountVerifiedForwardCrawler', async () => {
    await countTest(3).catch((error) => { throw(error); });
  });
});

async function countTest(expectedCount) {
  const _banCrawler = new NanoAccountForwardCrawler(bananode, account, previous, '1', undefined, expectedCount);
  const banCrawler = new BananoAccountVerifiedForwardCrawler(_banCrawler, bananojs.getAccountPublicKey);
  await banCrawler.initialize().catch((error) => { throw(error); });

  let expectedPrevious = previous;
  let count = 0;
  try {
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
