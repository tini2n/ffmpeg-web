// @ts-nocheck
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _FFmpeg_worker, _FFmpeg_resolves, _FFmpeg_rejects, _FFmpeg_logEventCallbacks, _FFmpeg_progressEventCallbacks, _FFmpeg_registerHandlers, _FFmpeg_send;
import { getUniqueID } from './utils';
import Worker from 'worker-loader!./worker.js';
import { ERRORS, FF_MESSAGE_TYPES } from './constants';
var FFmpeg = /** @class */ (function () {
    function FFmpeg() {
        var _this = this;
        _FFmpeg_worker.set(this, null);
        _FFmpeg_resolves.set(this, {});
        _FFmpeg_rejects.set(this, {});
        _FFmpeg_logEventCallbacks.set(this, []);
        _FFmpeg_progressEventCallbacks.set(this, []);
        this.loaded = false;
        _FFmpeg_registerHandlers.set(this, function () {
            if (__classPrivateFieldGet(_this, _FFmpeg_worker, "f")) {
                __classPrivateFieldGet(_this, _FFmpeg_worker, "f").onmessage = function (_a) {
                    var _b = _a.data, id = _b.id, type = _b.type, data = _b.data;
                    switch (type) {
                        case FF_MESSAGE_TYPES.LOAD:
                            _this.loaded = true;
                            __classPrivateFieldGet(_this, _FFmpeg_resolves, "f")[id](data);
                            break;
                        case FF_MESSAGE_TYPES.MOUNT:
                        case FF_MESSAGE_TYPES.UNMOUNT:
                        case FF_MESSAGE_TYPES.EXEC:
                        case FF_MESSAGE_TYPES.WRITE_FILE:
                        case FF_MESSAGE_TYPES.READ_FILE:
                        case FF_MESSAGE_TYPES.DELETE_FILE:
                        case FF_MESSAGE_TYPES.RENAME:
                        case FF_MESSAGE_TYPES.CREATE_DIR:
                        case FF_MESSAGE_TYPES.LIST_DIR:
                        case FF_MESSAGE_TYPES.DELETE_DIR:
                            __classPrivateFieldGet(_this, _FFmpeg_resolves, "f")[id](data);
                            break;
                        case FF_MESSAGE_TYPES.LOG:
                            __classPrivateFieldGet(_this, _FFmpeg_logEventCallbacks, "f").forEach(function (f) { return f(data); });
                            break;
                        case FF_MESSAGE_TYPES.PROGRESS:
                            __classPrivateFieldGet(_this, _FFmpeg_progressEventCallbacks, "f").forEach(function (f) { return f(data); });
                            break;
                        case FF_MESSAGE_TYPES.ERROR:
                            __classPrivateFieldGet(_this, _FFmpeg_rejects, "f")[id](data);
                            break;
                    }
                    delete __classPrivateFieldGet(_this, _FFmpeg_resolves, "f")[id];
                    delete __classPrivateFieldGet(_this, _FFmpeg_rejects, "f")[id];
                };
            }
        });
        _FFmpeg_send.set(this, function (_a, trans, 
        // @ts-ignore
        _b) {
            var type = _a.type, data = _a.data;
            if (trans === void 0) { trans = []; }
            var 
            // @ts-ignore
            _c = _b === void 0 ? {} : _b, signal = _c.signal;
            if (!__classPrivateFieldGet(_this, _FFmpeg_worker, "f")) {
                return Promise.reject(ERRORS.NOT_LOADED);
            }
            return new Promise(function (resolve, reject) {
                var id = getUniqueID();
                __classPrivateFieldGet(_this, _FFmpeg_worker, "f") && __classPrivateFieldGet(_this, _FFmpeg_worker, "f").postMessage({ id: id, type: type, data: data }, trans);
                __classPrivateFieldGet(_this, _FFmpeg_resolves, "f")[id] = resolve;
                __classPrivateFieldGet(_this, _FFmpeg_rejects, "f")[id] = reject;
                // signal?.addEventListener(
                //     "abort",
                //     () => {
                //         reject(new DOMException(`Message # ${id} was aborted`, "AbortError"));
                //     },
                //     { once: true }
                // );
            });
        });
        this.load = function (_a, _b) {
            if (_a === void 0) { _a = {}; }
            var classWorkerURL = _a.classWorkerURL, config = __rest(_a, ["classWorkerURL"]);
            var _c = _b === void 0 ? {} : _b, signal = _c.signal;
            if (!__classPrivateFieldGet(_this, _FFmpeg_worker, "f")) {
                //window.location.origin
                // this.#worker = new Worker(new URL("./dist/esm/worker.js", import.meta.url), { type: "module" });
                // this.#worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
                __classPrivateFieldSet(_this, _FFmpeg_worker, Worker(), "f");
                __classPrivateFieldGet(_this, _FFmpeg_registerHandlers, "f").call(_this);
                console.log('worker created', __classPrivateFieldGet(_this, _FFmpeg_worker, "f"), { Worker: Worker });
            }
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.LOAD,
                data: config,
            }, undefined, { signal: signal });
        };
        this.exec = function (args, timeout, _a) {
            if (timeout === void 0) { timeout = -1; }
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.EXEC,
                data: { args: args, timeout: timeout },
            }, undefined, { signal: signal });
        };
        this.writeFile = function (path, data, _a) {
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            var trans = [];
            if (data instanceof Uint8Array) {
                trans.push(data.buffer);
            }
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.WRITE_FILE,
                data: { path: path, data: data },
            }, trans, { signal: signal });
        };
        // writeFile(path, data) {
        //     this.module.FS.writeFile(path, data);
        // }
        this.createDir = function (path, _a) {
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.CREATE_DIR,
                data: { path: path },
            }, undefined, { signal: signal });
        };
        // createDir(path) {
        //     this.module.FS.mkdir(path);
        // }
        this.deleteDir = function (path, _a) {
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.DELETE_DIR,
                data: { path: path },
            }, undefined, { signal: signal });
        };
        // deleteDir(path) {
        //     this.module.FS.rmdir(path);
        // }
        this.deleteFile = function (path, _a) {
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.DELETE_FILE,
                data: { path: path },
            }, undefined, { signal: signal });
        };
        // deleteFile(path) {
        //     this.module.FS.unlink(path);
        // }
        this.readDir = function (path, _a) {
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.LIST_DIR,
                data: { path: path },
            }, undefined, { signal: signal });
        };
        // listFiles(path) {
        //     return this.module.FS.readdir(path);
        // }
        this.fileExists = function (path, _a) {
            var _b = _a === void 0 ? {} : _a, signal = _b.signal;
            return __classPrivateFieldGet(_this, _FFmpeg_send, "f").call(_this, {
                type: FF_MESSAGE_TYPES.LIST_DIR,
                data: { path: path },
            }, undefined, { signal: signal });
        };
        // fileExists(path) {
        //     try {
        //         this.module.FS.lookupPath(path);
        //         return true;
        //     } catch (e) {
        //         return false;
        //     }
        // }
    }
    return FFmpeg;
}());
export { FFmpeg };
_FFmpeg_worker = new WeakMap(), _FFmpeg_resolves = new WeakMap(), _FFmpeg_rejects = new WeakMap(), _FFmpeg_logEventCallbacks = new WeakMap(), _FFmpeg_progressEventCallbacks = new WeakMap(), _FFmpeg_registerHandlers = new WeakMap(), _FFmpeg_send = new WeakMap();
