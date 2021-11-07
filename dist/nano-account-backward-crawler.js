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
exports.NanoAccountBackwardCrawler = void 0;
// Iterable that makes requests as required when looping through blocks in an account.
var NanoAccountBackwardCrawler = /** @class */ (function () {
    function NanoAccountBackwardCrawler(nanoNode, account, head, accountFilter, count) {
        if (head === void 0) { head = undefined; }
        if (accountFilter === void 0) { accountFilter = undefined; }
        if (count === void 0) { count = undefined; }
        this.nanoNode = nanoNode;
        this.account = account;
        this.head = head;
        this.accountInfo = null;
        this.accountFilter = accountFilter;
        this.count = count;
    }
    NanoAccountBackwardCrawler.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var historySegmentPromise, accountInfoPromise, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        historySegmentPromise = this.nanoNode.getBackwardHistory(this.account, this.head, "0", this.accountFilter, this.count);
                        accountInfoPromise = this.nanoNode.getAccountInfo(this.account);
                        _a = this;
                        return [4 /*yield*/, historySegmentPromise];
                    case 1:
                        _a.accountHistory = _c.sent();
                        _b = this;
                        return [4 /*yield*/, accountInfoPromise];
                    case 2:
                        _b.accountInfo = _c.sent();
                        this.confirmationHeight = BigInt('' + this.accountInfo.confirmation_height);
                        return [2 /*return*/];
                }
            });
        });
    };
    NanoAccountBackwardCrawler.prototype[Symbol.asyncIterator] = function () {
        var _this = this;
        if (this.accountHistory === null || this.accountInfo === null || this.confirmationHeight <= BigInt('0')) {
            throw Error('NanoAccountCrawlerError: not initialized. Did you call initialize() before iterating?');
        }
        var maxRpcIterations = 1000;
        var rpcIterations = 0;
        var history = this.accountHistory.history;
        var historyIndex = undefined;
        var startBlock;
        var startBlockHeight;
        // set historyIndex to latest confirmed block
        for (var index = 0; index < history.length; index++) {
            startBlock = history[index];
            startBlockHeight = BigInt('' + startBlock.height);
            if (startBlockHeight > BigInt('0') && startBlockHeight <= this.confirmationHeight) {
                historyIndex = index;
                break;
            }
        }
        return {
            next: function () { return __awaiter(_this, void 0, void 0, function () {
                var block, blockHeight, _accountHistory;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (historyIndex === undefined || history.length === 0 || historyIndex >= history.length) {
                                return [2 /*return*/, { value: undefined, done: true }];
                            }
                            block = history[historyIndex];
                            blockHeight = BigInt('' + block.height);
                            if (blockHeight <= BigInt('0')) {
                                return [2 /*return*/, { value: undefined, done: true }];
                            }
                            historyIndex += 1;
                            if (!(historyIndex >= history.length)) return [3 /*break*/, 3];
                            if (!(block.previous === '0000000000000000000000000000000000000000000000000000000000000000')) return [3 /*break*/, 1];
                            return [2 /*return*/, { value: undefined, done: true }];
                        case 1:
                            // Guard against infinite loops and making too many RPC calls.
                            rpcIterations += 1;
                            if (rpcIterations > maxRpcIterations) {
                                throw Error("TooManyRpcIterations: Expected to fetch full history from nano node within " + maxRpcIterations + " requests.");
                            }
                            return [4 /*yield*/, this.nanoNode.getBackwardHistory(this.account, block.previous, "0", this.accountFilter, this.count)];
                        case 2:
                            _accountHistory = _a.sent();
                            history = _accountHistory.history;
                            historyIndex = 0;
                            _a.label = 3;
                        case 3:
                            if (this.reachedCount(startBlockHeight, blockHeight)) {
                                return [2 /*return*/, { value: block, done: true }];
                            }
                            else {
                                return [2 /*return*/, { value: block, done: false }];
                            }
                            return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    NanoAccountBackwardCrawler.prototype.reachedCount = function (startBlockHeight, blockHeight) {
        return this.count && (startBlockHeight - blockHeight) >= BigInt(this.count);
    };
    return NanoAccountBackwardCrawler;
}());
exports.NanoAccountBackwardCrawler = NanoAccountBackwardCrawler;
//# sourceMappingURL=nano-account-backward-crawler.js.map