import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from '../src/nano-node';
import { NanoAccountBackwardCrawler } from '../src/nano-account-backward-crawler';

const bananode = new NanoNode('https://kaliumapi.appditto.com/api', fetch);
const account = 'ban_1iw8sa3o57s6iso15hhzrs8todje1c3c5fcjwmneab7nz1o6d781cxxtddaf';
const head = '2DA1AE13457652BC5136DF83E05CB959A6EF5BCAED83E64978FD2B2D8080020A';

describe('NanoAccountBackwardCrawler using Kalium Banano API', function() {
  this.timeout(20000);

  it('has a valid chain using for await iterator on NanoAccountBackwardCrawler', async () => {
    const banCrawler = new NanoAccountBackwardCrawler(bananode, account, head);
    await banCrawler.initialize();

    let expectedHash = head;
    for await (const block of banCrawler) {
      expect(block.hash).to.equal(expectedHash);
      expectedHash = block.previous;
    }
  });

  it('works with a 1 block count limit on NanoAccountBackwardCrawler', async () => {
    countTest(1);
  });

  it('works with a 3 block count limit on NanoAccountBackwardCrawler', async () => {
    countTest(3);
  });
});

async function countTest(expectedCount) {
  const banCrawler = new NanoAccountBackwardCrawler(bananode, account, head, undefined, expectedCount);
    await banCrawler.initialize();

    let expectedHash = head;
    let count = 0;
    for await (const block of banCrawler) {
      count = count + 1;
      expect(block.hash).to.equal(expectedHash);
      expectedHash = block.previous;
    }
    expect(count).to.equal(expectedCount);
}
