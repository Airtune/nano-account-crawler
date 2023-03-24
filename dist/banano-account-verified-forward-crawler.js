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
exports.BananoAccountVerifiedForwardCrawler = void 0;
var bananojsImport = require("@bananocoin/bananojs");
var bananojs = bananojsImport;
// Iterable that makes requests as required when looping through blocks in an account.
var BananoAccountVerifiedForwardCrawler = /** @class */ (function () {
    function BananoAccountVerifiedForwardCrawler(nanoAccountForwardCrawler, accountToPublicKeyHex) {
        var account = nanoAccountForwardCrawler.account;
        this._publicKeyHex = accountToPublicKeyHex(account);
        this._nanoAccountForwardCrawler = nanoAccountForwardCrawler;
    }
    BananoAccountVerifiedForwardCrawler.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._nanoAccountForwardCrawler.initialize()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw (error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BananoAccountVerifiedForwardCrawler.prototype[Symbol.asyncIterator] = function () {
        var _this = this;
        var nanoAccountForwardIterator = this._nanoAccountForwardCrawler[Symbol.asyncIterator]();
        var expectedPrevious = undefined;
        return {
            next: function () { return __awaiter(_this, void 0, void 0, function () {
                var iteratorResult, error_2, blockStatusReturn, block, tempBlock, calculatedHash, hash, hashBytes, workBytes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, nanoAccountForwardIterator.next()];
                        case 1:
                            iteratorResult = _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            throw (error_2);
                        case 3:
                            blockStatusReturn = iteratorResult.value;
                            if (blockStatusReturn.status === "error") {
                                return [2 /*return*/, { value: blockStatusReturn, done: true }];
                            }
                            block = blockStatusReturn.value;
                            if (!block) {
                                return [2 /*return*/, { value: { status: "error", error_type: "MissingBlock", message: "expected block, got nothing" }, done: true }];
                            }
                            if (iteratorResult.done) {
                                return [2 /*return*/, { value: { status: "ok", data: undefined }, done: true }];
                            }
                            // Verify block has expected value for previous
                            if (typeof expectedPrevious === "string" && block.previous !== expectedPrevious) {
                                return [2 /*return*/, { value: { status: "error", error_type: "InvalidChain", message: "expectedPrevious: ".concat(expectedPrevious, " actual block.previous: ").concat(block.previous, " for block: ").concat(block.hash) }, done: true }];
                            }
                            tempBlock = {
                                account: this._nanoAccountForwardCrawler.account,
                                previous: block.previous,
                                representative: block.representative,
                                balance: block.balance,
                                link: block.link
                            };
                            calculatedHash = bananojs.getBlockHash(tempBlock);
                            if (calculatedHash !== block.hash) {
                                return [2 /*return*/, { value: { status: "error", error_type: "InvalidChain", message: "unexpected hash: ".concat(block.hash, " calculated: ").concat(calculatedHash) }, done: true }];
                            }
                            hash = block.previous;
                            if (hash === "0000000000000000000000000000000000000000000000000000000000000000") {
                                hash = this._publicKeyHex;
                            }
                            hashBytes = bananojs.bananoUtil.hexToBytes(hash);
                            workBytes = bananojs.bananoUtil.hexToBytes(block.work).reverse();
                            if (!bananojs.bananoUtil.isWorkValid(hashBytes, workBytes)) {
                                return [2 /*return*/, { value: { status: "error", error_type: "InvalidChain", message: "unable to verify work for: ".concat(hash, " with work: ").concat(block.work) }, done: true }];
                            }
                            // Verify signature
                            if (!bananojs.verify(block.hash, block.signature, this._publicKeyHex)) {
                                return [2 /*return*/, { value: { status: "error", error_type: "InvalidChain", message: "unable to verify signature for block: ".concat(block.hash) }, done: true }];
                            }
                            expectedPrevious = block.hash;
                            return [2 /*return*/, iteratorResult];
                    }
                });
            }); }
        };
    };
    return BananoAccountVerifiedForwardCrawler;
}());
exports.BananoAccountVerifiedForwardCrawler = BananoAccountVerifiedForwardCrawler;
//# sourceMappingURL=banano-account-verified-forward-crawler.js.map