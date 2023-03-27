import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from '../src/nano-node';
import { NanoAccountBackwardCrawler } from '../src/nano-account-backward-crawler';
import { INanoBlock, TAccount, TBlockHash } from '../src/nano-interfaces';
import { IStatusReturn } from '../src/status-return-interfaces';

const bananode = new NanoNode('http://145.239.223.42:7072', fetch);
const account: TAccount = 'ban_1iw8sa3o57s6iso15hhzrs8todje1c3c5fcjwmneab7nz1o6d781cxxtddaf';
const head: TBlockHash = '2DA1AE13457652BC5136DF83E05CB959A6EF5BCAED83E64978FD2B2D8080020A';

describe('NanoAccountBackwardCrawler using Banano Honey API', function() {
  this.timeout(200000);

  it('has a valid chain using for await iterator on NanoAccountBackwardCrawler', async () => {
    const banCrawler = new NanoAccountBackwardCrawler(bananode, account, head, undefined, undefined);
    await banCrawler.initialize().catch((error) => { throw(error); });
    let endBlock: (INanoBlock|undefined) = undefined;
    let expectedHash: TBlockHash = head;
    try {
      for await (const blockStatusReturn of banCrawler) {
        if (blockStatusReturn.status === "error") {
          throw `Got error of type ${blockStatusReturn.error_type} with message: ${blockStatusReturn.message}`;
        }
        const block = blockStatusReturn.value;
        if (!block) {
          throw `Unexpected blank block for blockStatusReturn`;
        }
        expect(block.hash).to.equal(expectedHash);
        expectedHash = block.previous;
        endBlock = block;
      }
      expect(endBlock?.height).to.equal('1');
    } catch(error) {
      throw(error);
    }
  });

  it('works with a 1 block count limit on NanoAccountBackwardCrawler', async () => {
    await countTest(1);
  });

  it('works with a 3 block count limit on NanoAccountBackwardCrawler', async () => {
    await countTest(3);
  });

  it('can crawl backward with account filter', async () => {
    let selection: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let account: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let _head: TBlockHash = "BE3334FA848D5174191C697BCD8A327487D4D4FF4F006264303F44DF568A620E";
    const banCrawler = new NanoAccountBackwardCrawler(bananode, account, _head, [selection]);
    await banCrawler.initialize();

    let blockCount: number = 0;
    try {
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
  const banCrawler = new NanoAccountBackwardCrawler(bananode, account, head, undefined, expectedCount);
    await banCrawler.initialize();

    let expectedHash: TBlockHash = head;
    let count: number = 0;
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
        expect(block.hash).to.equal(expectedHash);
        expectedHash = block.previous;
      }
    } catch(error) {
      throw(error);
    }
    expect(count).to.equal(expectedCount);
}
