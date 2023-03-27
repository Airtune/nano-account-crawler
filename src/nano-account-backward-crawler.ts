import { NanoNode } from './nano-node';
import {
  INanoAccountHistory,
  INanoAccountInfo,
  INanoAccountBackwardIterable,
  INanoBlock,
  TAccount,
  TBlockHash
} from './nano-interfaces';
import { IStatusReturn } from './status-return-interfaces';

// Iterable that makes requests as required when looping through blocks in an account.
export class NanoAccountBackwardCrawler implements INanoAccountBackwardIterable {
  public nanoNode: NanoNode;
  public account: TAccount;
  public head: TBlockHash;
  public accountFilter: TAccount[];

  private accountHistory: INanoAccountHistory;
  private accountInfo: INanoAccountInfo;
  private confirmationHeight: bigint;
  private count: number;
  private _maxBlocksPerRequest: number;
  private _maxRpcIterations: number;

  constructor(nanoNode: NanoNode, account: TAccount, head: string = undefined, accountFilter: TAccount[] = undefined, count: number = undefined, maxBlocksPerRequest: number = 3000) {
    this.nanoNode = nanoNode;
    this.account = account;
    this.head = head;
    this.accountInfo = null;
    this.accountFilter = accountFilter;
    this.count = count;
    this._maxBlocksPerRequest = Math.min(count || maxBlocksPerRequest, maxBlocksPerRequest);
    this._maxRpcIterations = 1000;
  }

  async initialize(): Promise<IStatusReturn<void>> {
    let accountHistoryStatusReturn: IStatusReturn<INanoAccountHistory>, accountInfoStatusReturn: IStatusReturn<INanoAccountInfo>;
    try {
      const historySegmentPromise = this.nanoNode.getBackwardHistory(this.account, this.head, "0", this.accountFilter, this._maxBlocksPerRequest);
      const accountInfoPromise = this.nanoNode.getAccountInfo(this.account);
      accountHistoryStatusReturn = await historySegmentPromise;
      accountInfoStatusReturn = await accountInfoPromise;
    } catch (error) {
      return {
        status: "error",
        error_type: "UnexpectedError",
        message: `Unexpected error occurred while initializing: ${error}`
      };
    }
  
    if (accountHistoryStatusReturn.status === "error") {
      return accountHistoryStatusReturn;
    }
  
    if (accountInfoStatusReturn.status === "error") {
      return accountInfoStatusReturn;
    }
  
    if (!accountInfoStatusReturn.value) {
      return {
        status: "error",
        error_type: "MissingAccountInfo",
        message: "Account info is missing after initializing"
      };
    }
  
    this.accountHistory = accountHistoryStatusReturn.value;
    this.accountInfo = accountInfoStatusReturn.value;

    if (typeof(this.accountInfo?.confirmation_height || 0) !== 'string' || !this.accountInfo?.confirmation_height.match(/^\d+$/)) {
      return {
        status: "error",
        error_type: "MissingAccountInfo",
        message: `Expected confirmation_height to be a string containing an integer, got: ${this.accountInfo?.confirmation_height} of type ${typeof this.accountInfo?.confirmation_height}`
      };
    }

    this.confirmationHeight = BigInt('' + (this.accountInfo.confirmation_height || 0));
  
    return {
      status: "ok"
    };
  }
  

  [Symbol.asyncIterator](): AsyncIterator<IStatusReturn<INanoBlock>> {
    if (this.accountHistory === null || this.accountInfo === null || this.confirmationHeight <= BigInt('0')) {
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
      next: async (): Promise<IteratorResult<IStatusReturn<INanoBlock>>> => {
        if (endReached || history === undefined || historyIndex === undefined || history.length === 0 || historyIndex >= history.length) {
          return { value: { status: "ok", value: undefined }, done: true };
        }
    
        const block: INanoBlock = history[historyIndex];
        const blockHeight = BigInt('' + block.height);
    
        if (blockHeight <= BigInt('0')) {
          return { value: { status: "ok", value: undefined }, done: true };
        }
    
        if (typeof this.accountFilter === "undefined" && typeof nextHash === "string" && block.hash !== nextHash) {
          return {
            value: {
              status: "error",
              error_type: "InvalidChain",
              message: `Expected nextHash: ${nextHash}, got: ${block.hash}`,
            },
            done: true,
          };
        }
    
        historyIndex += 1;
        if (historyIndex >= history.length) {
          if (block.previous === '0000000000000000000000000000000000000000000000000000000000000000') {
            endReached = true;
            return { value: { status: "ok", value: block }, done: false };
          } else {
            // Guard against infinite loops and making too many RPC calls.
            rpcIterations += 1;
            if (rpcIterations > this.maxRpcIterations) {
              return {
                value: {
                  status: "error",
                  error_type: "TooManyRpcIterations",
                  message: `Expected to fetch full history from nano node within ${this.maxRpcIterations} requests.`,
                },
                done: true,
              };
            }
    
            // TODO: Edge case optimization that reduce count on each rpc iteration so last iteration doesn't include bloat blocks for large requests.
            let _accountHistory;
            try {
              const _accountHistoryStatusReturn = await this.nanoNode.getBackwardHistory(this.account, block.previous, "0", this.accountFilter, this._maxBlocksPerRequest);
              if (_accountHistoryStatusReturn.status === "error") {
                return {
                  value: {
                    status: "error",
                    error_type: "UnexpectedError",
                    message: `Unexpected error during getBackwardHistory: ${_accountHistoryStatusReturn.error_type}: ${_accountHistoryStatusReturn.message}`,
                  },
                  done: true,
                };
              }
              _accountHistory = _accountHistoryStatusReturn.value;
            } catch (error) {
              return {
                value: {
                  status: "error",
                  error_type: "UnexpectedError",
                  message: error.message,
                },
                done: true,
              };
            }
            history = _accountHistory.history;
            historyIndex = 0;
          }
        }
    
        nextHash = block.previous;

        if (this.reachedCount(startBlockHeight, blockHeight - BigInt(1))) {
          endReached = true;
          return { value: { status: "ok", value: block }, done: false };
        } else {
          return { value: { status: "ok", value: block }, done: false };
        }
      },
    };    
  }

  private reachedCount(startBlockHeight: bigint, blockHeight: bigint): boolean {
    return this.count && (startBlockHeight - blockHeight) >= BigInt(this.count);
  }

  public get maxBlocksPerRequest(): number {
    return this.maxBlocksPerRequest;
  }

  public get maxRpcIterations(): number {
    return this._maxRpcIterations;
  }

  public set maxRpcIterations(value: number) {
    this._maxRpcIterations = value;
  }
}
