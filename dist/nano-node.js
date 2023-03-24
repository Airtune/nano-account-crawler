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
            var request, retries, response, errorResponse, responseStatus, isAccountHistoryValid, isAccountValid, error_1;
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
                        errorResponse = undefined;
                        _a.label = 1;
                    case 1:
                        if (!(retries < max_retries)) return [3 /*break*/, 8];
                        retries += 1;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.jsonRequest(request)];
                    case 3:
                        responseStatus = _a.sent();
                        if (responseStatus.status === "error") {
                            errorResponse = responseStatus;
                            return [3 /*break*/, 1];
                        }
                        response = responseStatus.value;
                        return [4 /*yield*/, this.validateIsAccountHistory(account, response)];
                    case 4:
                        isAccountHistoryValid = _a.sent();
                        return [4 /*yield*/, this.validateAccount(account, response)];
                    case 5:
                        isAccountValid = _a.sent();
                        if (isAccountHistoryValid.status === "error") {
                            errorResponse = isAccountHistoryValid;
                            return [3 /*break*/, 1];
                        }
                        if (isAccountValid.status === "error") {
                            errorResponse = isAccountValid;
                            return [3 /*break*/, 1];
                        }
                        errorResponse = undefined;
                        return [3 /*break*/, 8];
                    case 6:
                        error_1 = _a.sent();
                        errorResponse = {
                            status: "error",
                            error_type: "UnexpectedError",
                            message: "Unexpected error occurred while getting forward history: ".concat(error_1)
                        };
                        return [3 /*break*/, 1];
                    case 7: return [3 /*break*/, 1];
                    case 8:
                        if (!response) {
                            errorResponse = {
                                status: "error",
                                error_type: "MissingNanoNodeResponse",
                                message: "NanoNode response is missing after getting forward history"
                            };
                        }
                        if (errorResponse) {
                            return [2 /*return*/, errorResponse];
                        }
                        return [2 /*return*/, {
                                status: "ok",
                                value: response
                            }];
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
            var request, retries, response, errorResponse, responseStatus, isAccountHistoryValid, isAccountValid, error_2;
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
                        errorResponse = undefined;
                        _a.label = 1;
                    case 1:
                        if (!(retries < max_retries)) return [3 /*break*/, 8];
                        retries += 1;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.jsonRequest(request)];
                    case 3:
                        responseStatus = _a.sent();
                        if (responseStatus.status === "error") {
                            errorResponse = responseStatus;
                            return [3 /*break*/, 1];
                        }
                        response = responseStatus.value;
                        return [4 /*yield*/, this.validateIsAccountHistory(account, response)];
                    case 4:
                        isAccountHistoryValid = _a.sent();
                        return [4 /*yield*/, this.validateAccount(account, response)];
                    case 5:
                        isAccountValid = _a.sent();
                        if (isAccountHistoryValid.status === "error") {
                            errorResponse = isAccountHistoryValid;
                            return [3 /*break*/, 1];
                        }
                        if (isAccountValid.status === "error") {
                            errorResponse = isAccountValid;
                            return [3 /*break*/, 1];
                        }
                        errorResponse = undefined;
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _a.sent();
                        errorResponse = {
                            status: "error",
                            error_type: "UnexpectedError",
                            message: "Unexpected error occurred while getting backward history: ".concat(error_2)
                        };
                        return [3 /*break*/, 1];
                    case 7: return [3 /*break*/, 1];
                    case 8:
                        if (!response) {
                            errorResponse = {
                                status: "error",
                                error_type: "MissingNanoNodeResponse",
                                message: "NanoNode response is missing after getting backward history"
                            };
                        }
                        if (errorResponse) {
                            return [2 /*return*/, errorResponse];
                        }
                        return [2 /*return*/, {
                                status: "ok",
                                value: response
                            }];
                }
            });
        });
    };
    NanoNode.prototype.getAccountInfo = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, responseStatus, isAccountValid, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            action: 'account_info',
                            account: account
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.jsonRequest(request)];
                    case 2:
                        responseStatus = _a.sent();
                        if (responseStatus.status === "error") {
                            return [2 /*return*/, responseStatus];
                        }
                        response = responseStatus.value;
                        return [4 /*yield*/, this.validateIsAccountInfo(account, response)];
                    case 3:
                        isAccountValid = _a.sent();
                        if (isAccountValid.status === "error") {
                            return [2 /*return*/, isAccountValid];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                status: "error",
                                error_type: "UnexpectedError",
                                message: "Unexpected error occurred while getting account info: ".concat(error_3)
                            }];
                    case 5:
                        if (!response) {
                            return [2 /*return*/, {
                                    status: "error",
                                    error_type: "MissingNanoNodeResponse",
                                    message: "NanoNode response is missing after getting account info"
                                }];
                        }
                        return [2 /*return*/, {
                                status: "ok",
                                value: response
                            }];
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
                            body: undefined
                        };
                        try {
                            request.body = JSON.stringify(jsonRequest);
                        }
                        catch (error) {
                            return [2 /*return*/, {
                                    status: "error",
                                    error_type: "JsonStringifyError",
                                    message: "Error occurred while converting JSON request to string: ".concat(error)
                                }];
                        }
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
                        return [2 /*return*/, {
                                status: "error",
                                error_type: "UnexpectedError",
                                message: "Unexpected error occurred while making JSON request: ".concat(error_4)
                            }];
                    case 5:
                        if (!jsonResponse) {
                            return [2 /*return*/, {
                                    status: "error",
                                    error_type: "MissingJsonResponse",
                                    message: "JSON response is missing after making JSON request"
                                }];
                        }
                        return [2 /*return*/, {
                                status: "ok",
                                value: jsonResponse
                            }];
                }
            });
        });
    };
    /////////////
    // private //
    /////////////
    NanoNode.prototype.validateIsAccountHistory = function (account, accountHistory) {
        if (typeof (accountHistory) !== 'object') {
            return {
                status: "error",
                error_type: "UnexpectedNanoNodeResponse",
                message: "Unexpected accountHistory. Expected type to be 'object', got: ".concat(typeof (accountHistory), " for ").concat(account)
            };
        }
        if (accountHistory.hasOwnProperty('error')) {
            return {
                status: "error",
                error_type: "NanoNodeError",
                message: "".concat(accountHistory.error, " for ").concat(account)
            };
        }
        if (typeof (accountHistory.account) !== 'string') {
            return {
                status: "error",
                error_type: "UnexpectedNanoNodeResponse",
                message: "Unexpected accountHistory.account. Expected type to be 'string', got: ".concat(typeof (accountHistory.account), " for ").concat(account)
            };
        }
        if (!accountHistory.hasOwnProperty('history')) {
            return {
                status: "error",
                error_type: "UnexpectedNanoNodeResponse",
                message: "accountHistory doesn't have property 'history' for ".concat(account)
            };
        }
        var _prototype = Object.prototype.toString.call(accountHistory.history);
        if (!(_prototype === '[object String]' || _prototype === '[object Array]')) {
            return {
                status: "error",
                error_type: "UnexpectedNanoNodeResponse",
                message: "accountHistory.history not of type array or string. Got: ".concat(_prototype, " for ").concat(account)
            };
        }
        return { status: "ok" };
    };
    NanoNode.prototype.validateIsAccountInfo = function (account, accountInfo) {
        if (typeof (accountInfo) !== 'object') {
            return {
                status: "error",
                error_type: "UnexpectedNanoNodeResponse",
                message: "Unexpected accountInfo. Expected type to be 'object', got: '".concat(typeof (accountInfo), "' for ").concat(account)
            };
        }
        if (accountInfo.hasOwnProperty('error')) {
            return {
                status: "error",
                error_type: "NanoNodeError",
                message: "".concat(accountInfo.error, " for ").concat(account)
            };
        }
        if (typeof (accountInfo['confirmation_height']) !== 'string') {
            return {
                status: "error",
                error_type: "UnexpectedNanoNodeResponse",
                message: "Unexpected accountInfo['confirmation_height']. Expected type to be 'string', got: ".concat(typeof (accountInfo['confirmation_height']), " for ").concat(account)
            };
        }
        return { status: "ok" };
    };
    NanoNode.prototype.validateAccount = function (account, accountHistory) {
        // Warning: Nano node returns history for templatePrevious block ignoring if there's an issuer account mismatch.
        if (account !== accountHistory['account']) {
            return {
                status: "error",
                error_type: "AccountMismatch",
                message: "requested info for account '".concat(account, "' but head was for account '").concat(accountHistory['account'], "'")
            };
        }
        return { status: "ok" };
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