import { NanoNode } from './nano-node';
import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountBackwardIterable,
  INanoBlock
} from './nano-interfaces';

// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountBackwardCrawler implements INanoAccountBackwardIterable {
  public nanoNode: NanoNode;
  public account: string;
  public head: string;
  public accountFilter: string[];

  private accountHistory: INanoAccountHistory;
  private accountInfo: INanoAccountInfo;
  private confirmationHeight: BigInt;
  private count: number;
  private _maxRpcIterations: number;

  constructor(nanoNode: NanoNode, account: string, head: string = undefined, accountFilter: string[] = undefined, count: number = undefined) {
    this.nanoNode = nanoNode;
    this.account = account;
    this.head = head;
    this.accountInfo = null;
    this.accountFilter = accountFilter;
    this.count = count;
    this._maxRpcIterations = 1000;
  }

  async initialize() {
    const historySegmentPromise = this.nanoNode.getBackwardHistory(this.account, this.head, "0", this.accountFilter, this.count);
    const accountInfoPromise    = this.nanoNode.getAccountInfo(this.account);

    this.accountHistory = await historySegmentPromise;
    this.accountInfo    = await accountInfoPromise;

    this.confirmationHeight = BigInt('' + this.accountInfo.confirmation_height);
  }

  [Symbol.asyncIterator](): AsyncIterator<INanoBlock> {
    if (this.accountHistory === null || this.accountInfo === null || this.confirmationHeight <= BigInt('0')) {
      throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
    }

    const maxRpcIterations = 1000;
    let rpcIterations = 0;

    let history: INanoBlock[] = this.accountHistory.history;
    let historyIndex: number = undefined;

    let startBlock: INanoBlock;
    let startBlockHeight: bigint;
    let nextHash: string = undefined;

    // set historyIndex to latest confirmed block
    for (let index = 0; index < history.length; index++) {
      startBlock = history[index];
      startBlockHeight = BigInt('' + startBlock.height);
      if (startBlockHeight > BigInt('0') && startBlockHeight <= this.confirmationHeight) {
        historyIndex = index;
        break;
      }
    }

    let endReached = false;

    return {
      next: async (): Promise<IteratorResult<INanoBlock>> => {
        if (endReached || historyIndex === undefined || history.length === 0 || historyIndex >= history.length) {
          return { value: undefined, done: true };
        }

        const block: INanoBlock = history[historyIndex];
        const blockHeight = BigInt('' + block.height);

        if (blockHeight <= BigInt('0')) {
          return { value: undefined, done: true };
        }

        if (typeof this.accountFilter === "undefined" && typeof nextHash === "string" && block.hash !== nextHash) {
          throw Error(`InvalidChain: Expected nextHash: ${nextHash}, got: ${block.hash}`);
        }

        historyIndex += 1;
        if (historyIndex >= history.length) {
          if (block.previous === '0000000000000000000000000000000000000000000000000000000000000000') {
            endReached = true;
            return { value: block, done: false };
          } else {
            // Guard against infinite loops and making too many RPC calls.
            rpcIterations += 1;
            if (rpcIterations > maxRpcIterations) {
              throw Error(`TooManyRpcIterations: Expected to fetch full history from nano node within ${maxRpcIterations} requests.`);
            }

            // TODO: Edge case optimization that reduce count on each rpc iteration so last iteration doesn't include bloat blocks for large requests.
            let _accountHistory;
            try {
              _accountHistory = await this.nanoNode.getBackwardHistory(this.account, block.previous, "0", this.accountFilter, this.count);
            } catch(error) {
              throw(error);
            }
            history = _accountHistory.history;
            historyIndex = 0;
          }
        }

        nextHash = block.previous;

        if (this.reachedCount(startBlockHeight, blockHeight - BigInt(1))) {
          endReached = true;
          return { value: block, done: false };
        } else {
          return { value: block, done: false };
        }
      }
    };
  }

  private reachedCount(startBlockHeight: bigint, blockHeight: bigint): boolean {
    return this.count && (startBlockHeight - blockHeight) >= BigInt(this.count);
  }

  public get maxRpcIterations(): number {
    return this._maxRpcIterations;
  }

  public set maxRpcIterations(value: number) {
    this._maxRpcIterations = value;
  }
}
