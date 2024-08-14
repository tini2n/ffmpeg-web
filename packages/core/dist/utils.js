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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { v4 as uuid } from 'uuid';
// @ts-ignore
export var readFromBlobOrFile = function (blob) {
    return new Promise(function (resolve, reject) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var result = fileReader.result;
            if (result instanceof ArrayBuffer) {
                resolve(new Uint8Array(result));
            }
            else {
                resolve(new Uint8Array());
            }
        };
        fileReader.onerror = function (event) {
            var _a, _b;
            reject(Error("File could not be read! Code=".concat(((_b = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.code) || -1)));
        };
        fileReader.readAsArrayBuffer(blob);
    });
};
// @ts-ignore
export var fetchFile = function (file) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(typeof file === "string")) return [3 /*break*/, 5];
                if (!/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(file)) return [3 /*break*/, 1];
                data = atob(file.split(",")[1])
                    .split("")
                    .map(function (c) { return c.charCodeAt(0); });
                return [3 /*break*/, 4];
            case 1: return [4 /*yield*/, fetch(file)];
            case 2: return [4 /*yield*/, (_a.sent()).arrayBuffer()];
            case 3:
                data = _a.sent();
                _a.label = 4;
            case 4: return [3 /*break*/, 11];
            case 5:
                if (!(file instanceof URL)) return [3 /*break*/, 8];
                return [4 /*yield*/, fetch(file)];
            case 6: return [4 /*yield*/, (_a.sent()).arrayBuffer()];
            case 7:
                data = _a.sent();
                return [3 /*break*/, 11];
            case 8:
                if (!(file instanceof File || file instanceof Blob)) return [3 /*break*/, 10];
                return [4 /*yield*/, readFromBlobOrFile(file)];
            case 9:
                data = _a.sent();
                return [3 /*break*/, 11];
            case 10: return [2 /*return*/, new Uint8Array()];
            case 11: 
            // @ts-ignore
            return [2 /*return*/, new Uint8Array(data)];
        }
    });
}); };
export var importScript = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                var script = document.createElement("script");
                var eventHandler = function () {
                    script.removeEventListener("load", eventHandler);
                    // @ts-ignore
                    resolve();
                };
                script.src = url;
                script.type = "text/javascript";
                script.addEventListener("load", eventHandler);
                document.getElementsByTagName("head")[0].appendChild(script);
            })];
    });
}); };
// @ts-ignore
export var downloadWithProgress = function (url, cb) { return __awaiter(void 0, void 0, void 0, function () {
    var resp, buf, total, reader, chunks, received, _a, done, value, delta, data, position, _i, chunks_1, chunk, e_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, fetch(url)];
            case 1:
                resp = _c.sent();
                _c.label = 2;
            case 2:
                _c.trys.push([2, 7, , 9]);
                total = parseInt(resp.headers.get('Content-Length') || "-1");
                reader = (_b = resp.body) === null || _b === void 0 ? void 0 : _b.getReader();
                if (!reader)
                    throw 'ERROR_RESPONSE_BODY_READER';
                chunks = [];
                received = 0;
                _c.label = 3;
            case 3: return [4 /*yield*/, reader.read()];
            case 4:
                _a = _c.sent(), done = _a.done, value = _a.value;
                delta = value ? value.length : 0;
                if (done) {
                    if (total != -1 && total !== received)
                        throw 'ERROR_INCOMPLETED_DOWNLOAD';
                    cb && cb({ url: url, total: total, received: received, delta: delta, done: done });
                    return [3 /*break*/, 6];
                }
                chunks.push(value);
                received += delta;
                cb && cb({ url: url, total: total, received: received, delta: delta, done: done });
                _c.label = 5;
            case 5: return [3 /*break*/, 3];
            case 6:
                data = new Uint8Array(received);
                position = 0;
                for (_i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                    chunk = chunks_1[_i];
                    data.set(chunk, position);
                    position += chunk.length;
                }
                buf = data.buffer;
                return [3 /*break*/, 9];
            case 7:
                e_1 = _c.sent();
                console.log("failed to send download progress event: ", e_1);
                return [4 /*yield*/, resp.arrayBuffer()];
            case 8:
                // Fetch arrayBuffer directly when it is not possible to get progress.
                buf = _c.sent();
                cb &&
                    cb({
                        url: url,
                        total: buf.byteLength,
                        received: buf.byteLength,
                        delta: 0,
                        done: true,
                    });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/, buf];
        }
    });
}); };
// @ts-ignore
export var toBlobURL = function (url_1, mimeType_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1, mimeType_1], args_1, true), void 0, function (url, mimeType, progress, cb) {
        var buf, _a, blob;
        if (progress === void 0) { progress = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!progress) return [3 /*break*/, 2];
                    return [4 /*yield*/, downloadWithProgress(url, cb)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 2: return [4 /*yield*/, fetch(url)];
                case 3: return [4 /*yield*/, (_b.sent()).arrayBuffer()];
                case 4:
                    _a = _b.sent();
                    _b.label = 5;
                case 5:
                    buf = _a;
                    blob = new Blob([buf], { type: mimeType });
                    return [2 /*return*/, URL.createObjectURL(blob)];
            }
        });
    });
};
export var getUniqueID = function () {
    return uuid();
};
