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

  it('can crawl forward with account filter', async () => {
    let selection = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let account = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let _head = "201D206790E46B4CB24CA9F0DB370F8F4BA2E905D66E8DE825D36A9D0E775DAB";
    let count = 8;
    const banCrawler = new NanoAccountForwardCrawler(bananode, account, _head, undefined, [selection], count);
    await banCrawler.initialize();

    let blockCount = 0;
    for await (const block of banCrawler) {
      blockCount += 1;
    }
    expect(blockCount).to.equal(6);
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
