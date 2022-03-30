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
    await countTest(1);
  });

  it('works with a 3 block count limit on NanoAccountBackwardCrawler', async () => {
    await countTest(3);
  });

  it('can crawl backward with account filter', async () => {
    let selection = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let account = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let _head = "BE3334FA848D5174191C697BCD8A327487D4D4FF4F006264303F44DF568A620E";
    const banCrawler = new NanoAccountBackwardCrawler(bananode, account, _head, [selection]);
    await banCrawler.initialize();

    let blockCount = 0;
    for await (const block of banCrawler) {
      blockCount += 1;
    }
    expect(blockCount).to.equal(6);
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
