import { NanoNode } from './nano-node';
import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountForwardIterable,
  INanoBlock
} from './nano-interfaces';

// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountForwardCrawler implements INanoAccountForwardIterable {
  private _nanoNode: NanoNode;
  private _account: string;
  private _head: string;
  private _offset: string;
  private _accountFilter: string[];
  private _accountHistory: INanoAccountHistory;
  private _accountInfo: INanoAccountInfo;
  private _confirmationHeight: BigInt;
  private _count: number;
  private _maxRpcIterations: number;

  constructor(nanoNode: NanoNode, account: string, head: string = undefined, offset: string = undefined, accountFilter: string[] = undefined, count: number = undefined) {
    this._nanoNode = nanoNode;
    this._account = account;
    this._head = head;
    this._offset = offset;
    this._accountFilter = accountFilter;
    this._accountHistory = undefined;
    this._accountInfo = undefined;
    this._count = count;
    this._maxRpcIterations = 1000;
  }

  async initialize() {
    const historySegmentPromise = this._nanoNode.getForwardHistory(this._account, this._head, this._offset, this._accountFilter, this._count);
    const accountInfoPromise    = this._nanoNode.getAccountInfo(this._account);

    this._accountHistory = await historySegmentPromise;
    this._accountInfo    = await accountInfoPromise;

    this._confirmationHeight = BigInt('' + this._accountInfo.confirmation_height);
  }

  [Symbol.asyncIterator](): AsyncIterator<INanoBlock> {
    if (this._accountHistory === undefined || this._accountInfo === undefined || this._confirmationHeight <= BigInt('0')) {
      throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
    }

    
    let rpcIterations = 0;

    let history: INanoBlock[] = this._accountHistory.history;
    let historyIndex: number = 0;
    let previous: string = undefined;

    const startBlockHeight: (boolean|bigint) = history[historyIndex] && BigInt(history[historyIndex].height);

    return {
      next: async (): Promise<IteratorResult<INanoBlock>> => {
        if (history.length === 0 || historyIndex >= history.length) {
          return { value: undefined, done: true };
        }

        const block: INanoBlock = history[historyIndex];
        const blockHeight = BigInt('' + block.height);

        if (blockHeight <= BigInt('0') || blockHeight > this._confirmationHeight) {
          return { value: undefined, done: true };
        }

        if (blockHeight <= BigInt('0') || blockHeight > this._confirmationHeight) {
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
          if (this._nanoNode.hasMoreHistory(history, this._confirmationHeight)) {
            // Guard against infinite loops and making too many RPC calls.
            rpcIterations += 1;
            if (rpcIterations > this._maxRpcIterations) {
              throw Error(`TooManyRpcIterations: Expected to fetch full history from nano node within ${this._maxRpcIterations} requests.`);
            }
            // TODO: Edge case optimization that reduce count on each rpc iteration so last iteration doesn't include bloat blocks for large requests.
            const _accountHistory = await this._nanoNode.getForwardHistory(this._account, block.hash, "1", this._accountFilter, this._count);
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
    return this._count && (blockHeight - startBlockHeight) >= BigInt(this._count);
  }

  public get account(): string {
    return this._account;
  }

  public get maxRpcIterations(): number {
    return this._maxRpcIterations;
  }

  public set maxRpcIterations(value: number) {
    this._maxRpcIterations = value;
  }
}
