import { NanoNode } from './nano-node';
import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountForwardIterable,
  INanoBlock
} from './nano-interfaces';

// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountForwardCrawler implements INanoAccountForwardIterable {
  private nanoNode: NanoNode;
  private account: string;
  private head: string;
  private offset: string;
  private accountFilter: string[];
  private accountHistory: INanoAccountHistory;
  private accountInfo: INanoAccountInfo;
  private confirmationHeight: BigInt;
  private count: number;

  constructor(nanoNode: NanoNode, account: string, head: string = undefined, offset: string = undefined, accountFilter: string[] = undefined, count: number = undefined) {
    this.nanoNode = nanoNode;
    this.account = account;
    this.head = head;
    this.offset = offset;
    this.accountFilter = accountFilter;
    this.accountHistory = undefined;
    this.accountInfo = undefined;
    this.count = count;
  }

  async initialize() {
    const historySegmentPromise = this.nanoNode.getForwardHistory(this.account, this.head, this.offset, this.accountFilter, this.count);
    const accountInfoPromise    = this.nanoNode.getAccountInfo(this.account);

    this.accountHistory = await historySegmentPromise;
    this.accountInfo    = await accountInfoPromise;

    this.confirmationHeight = BigInt('' + this.accountInfo.confirmation_height);
  }

  [Symbol.asyncIterator](): AsyncIterator<INanoBlock> {
    if (this.accountHistory === undefined || this.accountInfo === undefined || this.confirmationHeight <= BigInt('0')) {
      throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
    }

    const maxRpcIterations = 1000;
    let rpcIterations = 0;

    let history: INanoBlock[] = this.accountHistory.history;
    let historyIndex: number = 0;
    let previous: string = undefined;

    const startBlockHeight: (boolean|bigint) = history[historyIndex] && BigInt(history[historyIndex].height);

    return {
      next: async () => {
        if (history.length === 0 || historyIndex >= history.length) {
          return { value: undefined, done: true };
        }

        const block: INanoBlock = history[historyIndex];
        const blockHeight = BigInt('' + block.height);

        if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
          return { value: undefined, done: true };
        }

        if (blockHeight <= BigInt('0') || blockHeight > this.confirmationHeight) {
          return { value: undefined, done: true };
        }

        if (typeof previous === "string" && block.previous !== previous) {
          throw Error(`InvalidChain: Expected previous: ${previous} got ${block.previous} for ${block.hash}`);
        }

        historyIndex += 1;
        if (historyIndex >= history.length) {
          // If it's the last block in the history returned by the nano node but it isn't the latest
          // confirmed block it's probably because the node didn't return the full history.
          // In this case fetch the next segment of the history following the last block.
          if (this.nanoNode.hasMoreHistory(history, this.confirmationHeight)) {
            // Guard against infinite loops and making too many RPC calls.
            rpcIterations += 1;
            if (rpcIterations > maxRpcIterations) {
              throw Error(`TooManyRpcIterations: Expected to fetch full history from nano node within ${maxRpcIterations} requests.`);
            }
            // TODO: Edge case optimization that reduce count on each rpc iteration so last iteration doesn't include bloat blocks for large requests.
            const _accountHistory = await this.nanoNode.getForwardHistory(this.account, block.hash, "1", this.accountFilter, this.count);
            history = _accountHistory.history;
            historyIndex = 0;
          }
        }

        previous = block.hash;

        if (this.reachedCount(startBlockHeight, blockHeight)) {
          return { value: block, done: true };
        } {
          return { value: block, done: false };
        }
      }
    };
  }

  private reachedCount(startBlockHeight: bigint, blockHeight: bigint): boolean {
    return this.count && (blockHeight - startBlockHeight) >= BigInt(this.count);
  }
}
