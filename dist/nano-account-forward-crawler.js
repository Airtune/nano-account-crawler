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
        while (_) try {
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
exports.NanoAccountForwardCrawler = void 0;
// Iterable that makes requests as required when looping through blocks in an account.
var NanoAccountForwardCrawler = /** @class */ (function () {
    function NanoAccountForwardCrawler(nanoNode, account, head, offset, accountFilter, count, maxBlocksPerRequest) {
        if (head === void 0) { head = undefined; }
        if (offset === void 0) { offset = undefined; }
        if (accountFilter === void 0) { accountFilter = undefined; }
        if (count === void 0) { count = undefined; }
        if (maxBlocksPerRequest === void 0) { maxBlocksPerRequest = 3000; }
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
    NanoAccountForwardCrawler.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var historySegmentPromise, accountInfoPromise, _a, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        historySegmentPromise = this._nanoNode.getForwardHistory(this._account, this._head, this._offset, this._accountFilter, this._maxBlocksPerRequest);
                        accountInfoPromise = this._nanoNode.getAccountInfo(this._account);
                        _a = this;
                        return [4 /*yield*/, historySegmentPromise];
                    case 1:
                        _a._accountHistory = _c.sent();
                        _b = this;
                        return [4 /*yield*/, accountInfoPromise];
                    case 2:
                        _b._accountInfo = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        throw (error_1);
                    case 4:
                        this._confirmationHeight = BigInt('' + this._accountInfo.confirmation_height);
                        return [2 /*return*/];
                }
            });
        });
    };
    NanoAccountForwardCrawler.prototype[Symbol.asyncIterator] = function () {
        var _this = this;
        if (this._accountHistory === undefined || this._accountInfo === undefined || this._confirmationHeight <= BigInt('0')) {
            throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
        }
        var rpcIterations = 0;
        var history = this._accountHistory.history;
        var historyIndex = 0;
        var previous = undefined;
        var endReached = false;
        var startBlockHeight = history[historyIndex] && BigInt(history[historyIndex].height);
        return {
            next: function () { return __awaiter(_this, void 0, void 0, function () {
                var block, blockHeight, _accountHistory, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (endReached || history.length === 0 || historyIndex >= history.length) {
                                return [2 /*return*/, { value: undefined, done: true }];
                            }
                            block = history[historyIndex];
                            blockHeight = BigInt('' + block.height);
                            if (blockHeight <= BigInt('0') || blockHeight > this._confirmationHeight) {
                                return [2 /*return*/, { value: undefined, done: true }];
                            }
                            if (blockHeight <= BigInt('0') || blockHeight > this._confirmationHeight) {
                                return [2 /*return*/, { value: undefined, done: true }];
                            }
                            if (typeof this._accountFilter === "undefined" && typeof previous === "string" && block.previous !== previous) {
                                throw Error("InvalidChain: Expected previous: ".concat(previous, " got ").concat(block.previous, " for ").concat(block.hash));
                            }
                            historyIndex += 1;
                            if (!(historyIndex >= history.length)) return [3 /*break*/, 5];
                            if (!this._nanoNode.hasMoreHistory(history, this._confirmationHeight)) return [3 /*break*/, 5];
                            // Guard against infinite loops and making too many RPC calls.
                            rpcIterations += 1;
                            if (rpcIterations > this._maxRpcIterations) {
                                throw Error("TooManyRpcIterations: Expected to fetch full history from nano node within ".concat(this._maxRpcIterations, " requests."));
                            }
                            _accountHistory = void 0;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this._nanoNode.getForwardHistory(this._account, block.hash, "1", this._accountFilter, this._maxBlocksPerRequest)];
                        case 2:
                            _accountHistory = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            throw (error_2);
                        case 4:
                            history = _accountHistory.history;
                            historyIndex = 0;
                            _a.label = 5;
                        case 5:
                            previous = block.hash;
                            if (this.exceededCount(startBlockHeight, blockHeight + BigInt(1))) {
                                return [2 /*return*/, { value: undefined, done: true }];
                            }
                            else if (this.reachedCount(startBlockHeight, blockHeight + BigInt(1))) {
                                endReached = true;
                                return [2 /*return*/, { value: block, done: false }];
                            }
                            {
                                return [2 /*return*/, { value: block, done: false }];
                            }
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    NanoAccountForwardCrawler.prototype.exceededCount = function (startBlockHeight, blockHeight) {
        return this._count && (blockHeight - startBlockHeight) > BigInt(this._count);
    };
    NanoAccountForwardCrawler.prototype.reachedCount = function (startBlockHeight, blockHeight) {
        return this._count && (blockHeight - startBlockHeight) >= BigInt(this._count);
    };
    Object.defineProperty(NanoAccountForwardCrawler.prototype, "account", {
        get: function () {
            return this._account;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NanoAccountForwardCrawler.prototype, "maxBlocksPerRequest", {
        get: function () {
            return this._maxBlocksPerRequest;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NanoAccountForwardCrawler.prototype, "maxRpcIterations", {
        get: function () {
            return this._maxRpcIterations;
        },
        set: function (value) {
            this._maxRpcIterations = value;
        },
        enumerable: false,
        configurable: true
    });
    return NanoAccountForwardCrawler;
}());
exports.NanoAccountForwardCrawler = NanoAccountForwardCrawler;
//# sourceMappingURL=nano-account-forward-crawler.js.map