"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NanoAccountBackwardCrawler = void 0;
// Iterable that makes requests as required when looping through blocks in an account.
var NanoAccountBackwardCrawler = /** @class */ (function () {
    function NanoAccountBackwardCrawler(nanoNode, account, head, accountFilter, count, maxBlocksPerRequest) {
        if (head === void 0) { head = undefined; }
        if (accountFilter === void 0) { accountFilter = undefined; }
        if (count === void 0) { count = undefined; }
        if (maxBlocksPerRequest === void 0) { maxBlocksPerRequest = 3000; }
        this.nanoNode = nanoNode;
        this.account = account;
        this.head = head;
        this.accountInfo = null;
        this.accountFilter = accountFilter;
        this.count = count;
        this._maxBlocksPerRequest = Math.min(count || maxBlocksPerRequest, maxBlocksPerRequest);
        this._maxRpcIterations = 1000;
    }
    NanoAccountBackwardCrawler.prototype.initialize = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var accountHistoryStatusReturn, accountInfoStatusReturn, historySegmentPromise, accountInfoPromise, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        historySegmentPromise = this.nanoNode.getBackwardHistory(this.account, this.head, "0", this.accountFilter, this._maxBlocksPerRequest);
                        accountInfoPromise = this.nanoNode.getAccountInfo(this.account);
                        return [4 /*yield*/, historySegmentPromise];
                    case 1:
                        accountHistoryStatusReturn = _e.sent();
                        return [4 /*yield*/, accountInfoPromise];
                    case 2:
                        accountInfoStatusReturn = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        return [2 /*return*/, {
                                status: "error",
                                error_type: "UnexpectedError",
                                message: "Unexpected error occurred while initializing: ".concat(error_1)
                            }];
                    case 4:
                        if (accountHistoryStatusReturn.status === "error") {
                            return [2 /*return*/, accountHistoryStatusReturn];
                        }
                        if (accountInfoStatusReturn.status === "error") {
                            return [2 /*return*/, accountInfoStatusReturn];
                        }
                        if (!accountInfoStatusReturn.value) {
                            return [2 /*return*/, {
                                    status: "error",
                                    error_type: "MissingAccountInfo",
                                    message: "Account info is missing after initializing"
                                }];
                        }
                        this.accountHistory = accountHistoryStatusReturn.value;
                        this.accountInfo = accountInfoStatusReturn.value;
                        if (typeof (((_a = this.accountInfo) === null || _a === void 0 ? void 0 : _a.confirmation_height) || 0) !== 'string' || !((_b = this.accountInfo) === null || _b === void 0 ? void 0 : _b.confirmation_height.match(/^\d+$/))) {
                            return [2 /*return*/, {
                                    status: "error",
                                    error_type: "MissingAccountInfo",
                                    message: "Expected confirmation_height to be a string containing an integer, got: ".concat((_c = this.accountInfo) === null || _c === void 0 ? void 0 : _c.confirmation_height, " of type ").concat(typeof ((_d = this.accountInfo) === null || _d === void 0 ? void 0 : _d.confirmation_height))
                                }];
                        }
                        this.confirmationHeight = BigInt('' + (this.accountInfo.confirmation_height || 0));
                        return [2 /*return*/, {
                                status: "ok"
                            }];
                }
            });
        });
    };
    NanoAccountBackwardCrawler.prototype[Symbol.asyncIterator] = function () {
        var _this = this;
        if (this.accountHistory === null || this.accountInfo === null || this.confirmationHeight <= BigInt('0')) {
            return {
                next: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, {
                                    value: {
                                        status: "error",
                                        error_type: "NanoAccountCrawlerError",
                                        message: "not initialized. Did you call initialize() before iterating?",
                                    },
                                    done: true,
                                }];
                        });
                    });
                },
            };
        }
        var rpcIterations = 0;
        var history = this.accountHistory.history;
        var historyIndex = undefined;
        var startBlock;
        var startBlockHeight;
        var nextHash = undefined;
        // set historyIndex to latest confirmed block
        for (var index = 0; index < history.length; index++) {
            startBlock = history[index];
            startBlockHeight = BigInt('' + startBlock.height);
            if (startBlockHeight > BigInt('0') && startBlockHeight <= this.confirmationHeight) {
                historyIndex = index;
                break;
            }
        }
        var endReached = false;
        return {
            next: function () { return __awaiter(_this, void 0, void 0, function () {
                var block, blockHeight, _accountHistory, _accountHistoryStatusReturn, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (endReached || history === undefined || historyIndex === undefined || history.length === 0 || historyIndex >= history.length) {
                                return [2 /*return*/, { value: { status: "ok", value: undefined }, done: true }];
                            }
                            block = history[historyIndex];
                            blockHeight = BigInt('' + block.height);
                            if (blockHeight <= BigInt('0')) {
                                return [2 /*return*/, { value: { status: "ok", value: undefined }, done: true }];
                            }
                            if (typeof this.accountFilter === "undefined" && typeof nextHash === "string" && block.hash !== nextHash) {
                                return [2 /*return*/, {
                                        value: {
                                            status: "error",
                                            error_type: "InvalidChain",
                                            message: "Expected nextHash: ".concat(nextHash, ", got: ").concat(block.hash),
                                        },
                                        done: true,
                                    }];
                            }
                            historyIndex += 1;
                            if (!(historyIndex >= history.length)) return [3 /*break*/, 6];
                            if (!(block.previous === '0000000000000000000000000000000000000000000000000000000000000000')) return [3 /*break*/, 1];
                            endReached = true;
                            return [2 /*return*/, { value: { status: "ok", value: block }, done: false }];
                        case 1:
                            // Guard against infinite loops and making too many RPC calls.
                            rpcIterations += 1;
                            if (rpcIterations > this.maxRpcIterations) {
                                return [2 /*return*/, {
                                        value: {
                                            status: "error",
                                            error_type: "TooManyRpcIterations",
                                            message: "Expected to fetch full history from nano node within ".concat(this.maxRpcIterations, " requests."),
                                        },
                                        done: true,
                                    }];
                            }
                            _accountHistory = void 0;
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.nanoNode.getBackwardHistory(this.account, block.previous, "0", this.accountFilter, this._maxBlocksPerRequest)];
                        case 3:
                            _accountHistoryStatusReturn = _a.sent();
                            if (_accountHistoryStatusReturn.status === "error") {
                                return [2 /*return*/, {
                                        value: {
                                            status: "error",
                                            error_type: "UnexpectedError",
                                            message: "Unexpected error during getBackwardHistory: ".concat(_accountHistoryStatusReturn.error_type, ": ").concat(_accountHistoryStatusReturn.message),
                                        },
                                        done: true,
                                    }];
                            }
                            _accountHistory = _accountHistoryStatusReturn.value;
                            return [3 /*break*/, 5];
                        case 4:
                            error_2 = _a.sent();
                            return [2 /*return*/, {
                                    value: {
                                        status: "error",
                                        error_type: "UnexpectedError",
                                        message: error_2.message,
                                    },
                                    done: true,
                                }];
                        case 5:
                            history = _accountHistory.history;
                            historyIndex = 0;
                            _a.label = 6;
                        case 6:
                            nextHash = block.previous;
                            if (this.reachedCount(startBlockHeight, blockHeight - BigInt(1))) {
                                endReached = true;
                                return [2 /*return*/, { value: { status: "ok", value: block }, done: false }];
                            }
                            else {
                                return [2 /*return*/, { value: { status: "ok", value: block }, done: false }];
                            }
                            return [2 /*return*/];
                    }
                });
            }); },
        };
    };
    NanoAccountBackwardCrawler.prototype.reachedCount = function (startBlockHeight, blockHeight) {
        return this.count && (startBlockHeight - blockHeight) >= BigInt(this.count);
    };
    Object.defineProperty(NanoAccountBackwardCrawler.prototype, "maxBlocksPerRequest", {
        get: function () {
            return this.maxBlocksPerRequest;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NanoAccountBackwardCrawler.prototype, "maxRpcIterations", {
        get: function () {
            return this._maxRpcIterations;
        },
        set: function (value) {
            this._maxRpcIterations = value;
        },
        enumerable: false,
        configurable: true
    });
    return NanoAccountBackwardCrawler;
}());
exports.NanoAccountBackwardCrawler = NanoAccountBackwardCrawler;
//# sourceMappingURL=nano-account-backward-crawler.js.map