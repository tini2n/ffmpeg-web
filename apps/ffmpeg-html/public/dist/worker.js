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
// @ts-nocheck
console.log('worker.ts');
import { ERRORS, FF_MESSAGE_TYPES } from "./constants";
var ffmpeg;
var load = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var e_1;
    var 
    // coreURL = '../../../wasm/dist/ffmpeg.js',
    // coreURL = 'http://127.0.0.1:8080/ffmpeg.js',
    _c = _b.coreURL, 
    // coreURL = '../../../wasm/dist/ffmpeg.js',
    // coreURL = 'http://127.0.0.1:8080/ffmpeg.js',
    coreURL = _c === void 0 ? './ffmpeg.js' : _c, 
    // coreURL = './dist/umd/ffmpeg.js',
    // coreURL = '../wasm/ffmpeg.js',
    wasmURL = _b.wasmURL, workerURL = _b.workerURL;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // const first = !ffmpeg;
                console.log('load from worker');
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                // await importScript(coreURL);
                importScripts(coreURL);
                console.log('scripts imported:', { self: self });
                return [4 /*yield*/, self.createFFmpegCore('./ffmpeg.wasm')];
            case 2:
                // // @ts-ignore
                // (self as WorkerGlobalScope).createFFmpegCore = (
                //     // @ts-ignore
                //     (await import(fullPath)) as ImportedFFmpegCoreModuleFactory
                // ).default;
                // @ts-ignore
                ffmpeg = _d.sent();
                console.log('ffmpeg:', { ffmpeg: ffmpeg });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _d.sent();
                console.error('error', e_1);
                if (!self.createFFmpegCore) {
                    throw ERRORS.IMPORT_FAILURE;
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var exec = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ffmpeg['callMain'](args)];
            case 1:
                resp = _a.sent();
                return [2 /*return*/, resp];
        }
    });
}); };
var writeFile = function (path, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ffmpeg.FS.writeFile(path, data);
        return [2 /*return*/, true];
    });
}); };
var readFile = function (path, options) {
    return ffmpeg.FS.readFile(path, { encoding: options.encoding });
};
var deleteFile = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ffmpeg.FS.unlink(path);
        return [2 /*return*/, true];
    });
}); };
var rename = function (oldPath, newPath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ffmpeg.FS.rename(oldPath, newPath);
        return [2 /*return*/, true];
    });
}); };
var createDir = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ffmpeg.FS.mkdir(path);
        return [2 /*return*/, true];
    });
}); };
var listDir = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ffmpeg.FS.readdir(path)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
// @ts-ignore
var mount = function (_a) {
    var fsType = _a.fsType, options = _a.options, mountPoint = _a.mountPoint;
    var filesystem = ffmpeg.FS.filesystems[fsType];
    if (!filesystem)
        return false;
    //@ts-ignore
    ffmpeg.FS.mount(filesystem, options, mountPoint);
    return true;
};
var unmount = function (mountPoint) {
    ffmpeg.FS.unmount(mountPoint);
};
self.onmessage = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var trans, data, _c, e_2;
    var _d = _b.data, id = _d.id, type = _d.type, _data = _d.data;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                trans = [];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 17, , 18]);
                if (type !== FF_MESSAGE_TYPES.LOAD && !ffmpeg)
                    throw ERRORS.NOT_LOADED;
                _c = type;
                switch (_c) {
                    case FF_MESSAGE_TYPES.LOAD: return [3 /*break*/, 2];
                    case FF_MESSAGE_TYPES.EXEC: return [3 /*break*/, 4];
                    case FF_MESSAGE_TYPES.WRITE_FILE: return [3 /*break*/, 6];
                    case FF_MESSAGE_TYPES.READ_FILE: return [3 /*break*/, 7];
                    case FF_MESSAGE_TYPES.DELETE_FILE: return [3 /*break*/, 8];
                    case FF_MESSAGE_TYPES.RENAME: return [3 /*break*/, 9];
                    case FF_MESSAGE_TYPES.CREATE_DIR: return [3 /*break*/, 10];
                    case FF_MESSAGE_TYPES.LIST_DIR: return [3 /*break*/, 11];
                    case FF_MESSAGE_TYPES.DELETE_DIR: return [3 /*break*/, 12];
                    case FF_MESSAGE_TYPES.MOUNT: return [3 /*break*/, 13];
                    case FF_MESSAGE_TYPES.UNMOUNT: return [3 /*break*/, 14];
                }
                return [3 /*break*/, 15];
            case 2: return [4 /*yield*/, load(_data)];
            case 3:
                data = _e.sent();
                return [3 /*break*/, 16];
            case 4: return [4 /*yield*/, exec(_data)];
            case 5:
                data = _e.sent();
                return [3 /*break*/, 16];
            case 6:
                // @ts-ignore
                data = writeFile.apply(void 0, _data);
                return [3 /*break*/, 16];
            case 7:
                data = readFile.apply(void 0, _data);
                if (data instanceof Uint8Array) {
                    trans.push(data.buffer);
                }
                return [3 /*break*/, 16];
            case 8:
                // @ts-ignore
                data = deleteFile.apply(void 0, _data);
                return [3 /*break*/, 16];
            case 9:
                // @ts-ignore
                data = rename.apply(void 0, _data);
                return [3 /*break*/, 16];
            case 10:
                // @ts-ignore
                data = createDir.apply(void 0, _data);
                return [3 /*break*/, 16];
            case 11:
                // @ts-ignore
                data = listDir.apply(void 0, _data);
                return [3 /*break*/, 16];
            case 12:
                // @ts-ignore
                data = deleteFile.apply(void 0, data);
                return [3 /*break*/, 16];
            case 13:
                data = mount.apply(void 0, _data);
                return [3 /*break*/, 16];
            case 14:
                // @ts-ignore
                data = unmount(_data);
                return [3 /*break*/, 16];
            case 15: throw ERRORS.UNKNOWN_TYPE;
            case 16: return [3 /*break*/, 18];
            case 17:
                e_2 = _e.sent();
                self.postMessage({
                    id: id,
                    type: FF_MESSAGE_TYPES.ERROR,
                    data: e_2.toString(),
                });
                return [2 /*return*/];
            case 18:
                // @ts-ignore
                self.postMessage({ id: id, type: type, data: data }, trans);
                return [2 /*return*/];
        }
    });
}); };
