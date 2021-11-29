import * as bananojs from '@bananocoin/bananojs';
import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from '../src/nano-node';
import { NanoAccountForwardCrawler } from '../src/nano-account-forward-crawler';

const bananode = new NanoNode('https://kaliumapi.appditto.com/api', fetch);
const account = 'ban_1iw8sa3o57s6iso15hhzrs8todje1c3c5fcjwmneab7nz1o6d781cxxtddaf';
const previous = '2DA1AE13457652BC5136DF83E05CB959A6EF5BCAED83E64978FD2B2D8080020A';

describe('NanoAccountForwardCrawler using Kalium Banano API', function() {
  this.timeout(20000);

  it('has a valid chain using for await iterator on NanoAccountForwardCrawler', async () => {
    const banCrawler = new NanoAccountForwardCrawler(bananode, account, previous, '1', undefined, 100);
    await banCrawler.initialize();

    let expectedPrevious = previous;
    for await (const block of banCrawler) {
      expect(block.previous).to.equal(expectedPrevious);
      expectedPrevious = block.hash;
    }
  });

  it('works with a 1 block count limit on NanoAccountForwardCrawler', async () => {
    await countTest(1);
  });

  it('works with a 3 block count limit on NanoAccountForwardCrawler', async () => {
    await countTest(3);
  });
});

async function countTest(expectedCount) {
  const banCrawler = new NanoAccountForwardCrawler(bananode, account, previous, '1', undefined, expectedCount);
    await banCrawler.initialize();

    let expectedPrevious = previous;
    let count = 0;
    for await (const block of banCrawler) {
      count = count + 1;
      expect(block.previous).to.equal(expectedPrevious);
      expectedPrevious = block.hash;
    }
    expect(count).to.equal(expectedCount);
}
