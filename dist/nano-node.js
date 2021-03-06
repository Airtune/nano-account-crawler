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
exports.NanoNode = void 0;
var NanoNode = /** @class */ (function () {
    function NanoNode(nodeApiUrl, fetch) {
        this.nodeApiUrl = nodeApiUrl;
        this.fetch = fetch;
    }
    NanoNode.prototype.getForwardHistory = function (account, head, offset, account_filter, count, max_retries) {
        if (head === void 0) { head = undefined; }
        if (offset === void 0) { offset = "0"; }
        if (account_filter === void 0) { account_filter = undefined; }
        if (count === void 0) { count = undefined; }
        if (max_retries === void 0) { max_retries = 3; }
        return __awaiter(this, void 0, void 0, function () {
            var request, retries, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            action: 'account_history',
                            account: account,
                            count: -1,
                            offset: offset,
                            reverse: "true",
                            raw: true
                        };
                        if (head) {
                            request.head = head;
                        }
                        if (account_filter) {
                            request.account_filter = account_filter;
                        }
                        if (count) {
                            request.count = count;
                        }
                        retries = 0;
                        response = undefined;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        retries += 1;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.jsonRequest(request)];
                    case 3:
                        response = _a.sent();
                        this.validateIsAccountHistory(response);
                        this.validateAccount(account, response);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        if (retries >= max_retries || !error_1.message.match(/^NanoNodeError:/)) {
                            throw error_1;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, response];
                }
            });
        });
    };
    NanoNode.prototype.getBackwardHistory = function (account, head, offset, account_filter, count, max_retries) {
        if (head === void 0) { head = undefined; }
        if (offset === void 0) { offset = "0"; }
        if (account_filter === void 0) { account_filter = undefined; }
        if (count === void 0) { count = undefined; }
        if (max_retries === void 0) { max_retries = 3; }
        return __awaiter(this, void 0, void 0, function () {
            var request, retries, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            action: 'account_history',
                            account: account,
                            count: -1,
                            raw: true
                        };
                        if (head) {
                            request.head = head;
                        }
                        if (account_filter) {
                            request.account_filter = account_filter;
                        }
                        if (count) {
                            request.count = count;
                        }
                        retries = 0;
                        response = undefined;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        retries += 1;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.jsonRequest(request)];
                    case 3:
                        response = _a.sent();
                        this.validateIsAccountHistory(response);
                        this.validateAccount(account, response);
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _a.sent();
                        if (retries >= max_retries || !error_2.message.match(/^NanoNodeError:/)) {
                            throw error_2;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, response];
                }
            });
        });
    };
    NanoNode.prototype.getAccountInfo = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            action: 'account_info',
                            account: account
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.jsonRequest(request)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        throw (error_3);
                    case 4:
                        this.validateIsAccountInfo(response);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    NanoNode.prototype.hasMoreHistory = function (history, confirmationHeight) {
        return !this.historyIsEmpty(history) && this.historyFrontierIsBehind(history, confirmationHeight);
    };
    NanoNode.prototype.historyIsEmpty = function (history) {
        return history.length === 0 || history.length === undefined;
    };
    NanoNode.prototype.jsonRequest = function (jsonRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, jsonResponse, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            method: 'POST',
                            mode: 'cors',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify(jsonRequest)
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.fetch(this.nodeApiUrl, request)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        jsonResponse = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        throw (error_4);
                    case 5: return [2 /*return*/, jsonResponse];
                }
            });
        });
    };
    /////////////
    // private //
    /////////////
    NanoNode.prototype.validateIsAccountHistory = function (accountHistory) {
        if (typeof (accountHistory) !== 'object') {
            throw Error("UnexpectedNanoNodeResponse: Unexpected accountHistory. Expected type to be 'object', got: ".concat(typeof (accountHistory)));
        }
        if (accountHistory.hasOwnProperty('error')) {
            throw Error("NanoNodeError: ".concat(accountHistory.error));
        }
        if (typeof (accountHistory.account) !== 'string') {
            throw Error("UnexpectedNanoNodeResponse: Unexpected accountHistory.account. Expected type to be 'string', got: ".concat(typeof (accountHistory.account)));
        }
        if (!accountHistory.hasOwnProperty('history')) {
            throw Error("UnexpectedNanoNodeResponse: accountHistory doesn't have property 'history'");
        }
        var _prototype = Object.prototype.toString.call(accountHistory.history);
        if (!(_prototype === '[object String]' || _prototype === '[object Array]')) {
            throw Error("UnexpectedNanoNodeResponse: accountHistory.history not of type array or string. Got: ".concat(_prototype));
        }
    };
    NanoNode.prototype.validateIsAccountInfo = function (accountInfo) {
        if (typeof (accountInfo) !== 'object') {
            throw Error("UnexpectedNanoNodeResponse: Unexpected accountInfo. Expected type to be 'object', got: ".concat(typeof (accountInfo)));
        }
        if (accountInfo.hasOwnProperty('error')) {
            throw Error("NanoNodeError: ".concat(accountInfo.error));
        }
        if (typeof (accountInfo['confirmation_height']) !== 'string') {
            throw Error("UnexpectedNanoNodeResponse: Unexpected accountInfo['confirmation_height']. Expected type to be 'string', got: ".concat(typeof (accountInfo['confirmation_height'])));
        }
    };
    NanoNode.prototype.validateAccount = function (account, accountHistory) {
        // Warning: Nano node returns history for templatePrevious block ignoring if there's an issuer account mismatch.
        if (account !== accountHistory['account']) {
            throw Error("AccountMismatch: requested info for account '".concat(account, "' but head was for account '").concat(accountHistory['account'], "'"));
        }
    };
    ;
    NanoNode.prototype.historyFrontierIsBehind = function (history, confirmationHeight) {
        var historyLastBlock = history[history.length - 1];
        var historyHeight = BigInt('' + historyLastBlock['height']);
        return historyHeight > BigInt('0') && historyHeight < confirmationHeight;
    };
    return NanoNode;
}());
exports.NanoNode = NanoNode;
//# sourceMappingURL=nano-node.js.map