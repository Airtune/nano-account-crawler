import { NanoNode } from './nano-node';
import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountForwardIterable,
  INanoBlock,
  TAccount,
  TBlockHash,
  TStringBigInt
} from './nano-interfaces';
import { IStatusReturn } from './status-return-interfaces';

// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountForwardCrawler implements INanoAccountForwardIterable {
  private _nanoNode: NanoNode;
  private _account: TAccount;
  private _head: TBlockHash;
  private _offset: TStringBigInt;
  private _accountFilter: TAccount[];
  private _accountHistory: INanoAccountHistory;
  private _accountInfo: INanoAccountInfo;
  private _confirmationHeight: bigint;
  private _count: number;
  private _maxBlocksPerRequest: number;
  private _maxRpcIterations: number;

  constructor(nanoNode: NanoNode, account: TAccount, head: TBlockHash = undefined, offset: TStringBigInt = undefined, accountFilter: TAccount[] = undefined, count: number = undefined, maxBlocksPerRequest: number = 3000) {
    this._nanoNode = nanoNode;
    this._account = account;
    this._head = head;
    this._offset = offset;
    this._accountFilter = accountFilter;
    this._accountHistory = undefined;
    this._accountInfo = undefined;
    this._count = count;
    this._maxBlocksPerRequest = Math.min(count || maxBlocksPerRequest, maxBlocksPerRequest);
    this._maxRpcIterations = 1000;
  }

  async initialize(): Promise<IStatusReturn<void>> {
    try {
      const historySegmentPromise = this._nanoNode.getForwardHistory(this._account, this._head, this._offset, this._accountFilter, this._maxBlocksPerRequest);
      const accountInfoPromise    = this._nanoNode.getAccountInfo(this._account);
      const historySegmentResponse = await historySegmentPromise;
      const accountInfoResponse = await accountInfoPromise;
      
      if (historySegmentResponse.status === "error") {
        return historySegmentResponse;
      }
      
      if (accountInfoResponse.status === "error") {
        return accountInfoResponse;
      }
  
      this._accountHistory = historySegmentResponse.value;
      this._accountInfo    = accountInfoResponse.value;
    } catch(error) {
      return {
        status: "error",
        error_type: "UnexpectedError",
        message: `Unexpected error occurred while initializing: ${error}`
      };
    }
  
    if (!this._accountInfo) {
      return {
        status: "error",
        error_type: "MissingAccountInfo",
        message: "Account info is missing after initialization"
      };
    }
  
    this._confirmationHeight = BigInt('' + this._accountInfo.confirmation_height);
  
    return { status: "ok" };
  }

  [Symbol.asyncIterator](): AsyncIterator<IStatusReturn<INanoBlock>> {
    if (this._accountHistory === undefined || this._accountInfo === undefined || this._confirmationHeight <= BigInt('0')) {
      return {
        async next(): Promise<IteratorResult<IStatusReturn<INanoBlock>>> {
          return {
            value: {
              status: "error",
              error_type: "NanoAccountCrawlerError",
              message: "not initialized. Did you call initialize() before iterating?",
            },
            done: true,
          };
        },
      };
    }
      
    let rpcIterations = 0;
  
    let history: INanoBlock[] = this._accountHistory.history;
    let historyIndex: number = 0;
    let previous: string = undefined;
    let endReached = false;
  
    const startBlockHeight: (boolean|bigint) = history[historyIndex] && BigInt(history[historyIndex].height);
  
    return {
      next: async (): Promise<IteratorResult<IStatusReturn<INanoBlock>>> => {
        if (endReached || history.length === 0 || historyIndex >= history.length) {
          return { value: { status: "done", done: true }, done: true };
        }

        const block: INanoBlock = history[historyIndex];
        const blockHeight = BigInt('' + block.height);

        if (blockHeight <= BigInt('0') || blockHeight > this._confirmationHeight) {
          return {
            value: {
              status: "error",
              error_type: "InvalidBlockHeightError",
              message: `Block height ${blockHeight} is outside valid range (0, ${this._confirmationHeight}]`,
            },
            done: true,
          };
        }

        if (typeof this._accountFilter === "undefined" && typeof previous === "string" && block.previous !== previous) {
          return {
            value: {
              status: "error",
              error_type: "InvalidChainError",
              message: `Expected previous: ${previous}, got ${block.previous} for ${block.hash}`,
            },
            done: true,
          };
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
              return {
                value: {
                  status: "error",
                  error_type: "TooManyRpcIterationsError",
                  message: `Expected to fetch full history from nano node within ${this._maxRpcIterations} requests.`,
                },
                done: true,
              };
            }
            // TODO: Edge case optimization that reduce count on each rpc iteration so last iteration doesn't include bloat blocks for large requests.
            let _accountHistory;
            try {
              _accountHistory = await this._nanoNode.getForwardHistory(this._account, block.hash, "1", this._accountFilter, this._maxBlocksPerRequest);
            } catch(error) {
              return {
                value: {
                  status: "error",
                  error_type: "RpcError",
                  message: error.message,
                },
                done: true,
              };
            }
            history = _accountHistory.history;
            historyIndex = 0;
          }
        }

        previous = block.hash;
        if (this.exceededCount(startBlockHeight, blockHeight + BigInt(1))) {
          return {
            value: {
              status: "error",
              error_type: "CountExceededError",
              message: `Reached maximum count (${this._count}) before reaching confirmation height (${this._confirmationHeight})`,
            },
            done: true,
          };
        } else if (this.reachedCount(startBlockHeight, blockHeight + BigInt(1))) {
          endReached = true;
          return { value: { status: "ok", value: block }, done: false };
        } {
          return { value: { status: "ok", value: block }, done: false };
        }
      }
    };

  }

  private exceededCount(startBlockHeight: bigint, blockHeight: bigint): boolean {
    return this._count && (blockHeight - startBlockHeight) > BigInt(this._count);
  }

  private reachedCount(startBlockHeight: bigint, blockHeight: bigint): boolean {
    return this._count && (blockHeight - startBlockHeight) >= BigInt(this._count);
  }

  public get account(): string {
    return this._account;
  }

  public get maxBlocksPerRequest(): number {
    return this._maxBlocksPerRequest;
  }

  public get maxRpcIterations(): number {
    return this._maxRpcIterations;
  }

  public set maxRpcIterations(value: number) {
    this._maxRpcIterations = value;
  }
}
